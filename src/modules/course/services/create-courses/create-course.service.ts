/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../../dto/create-course.dto';
import { Course } from '../../entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities';
import { TransactionalService } from '../../../../common/helpers/execute-transaction.helper';
import { CheckUserExistServiceCourse } from './check-users-to-create-courses.service';
import { VerifyTopicCourseService } from './check-topics-courses.service';
import { UploadCloudinaryService } from '../../../../common/services/upload-cloudinary.service';

@Injectable()
export class CreateCourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly checkUserExistCourse: CheckUserExistServiceCourse,
    private readonly transactionalService: TransactionalService,
    private readonly topicsService: VerifyTopicCourseService,
    private readonly uploadService: UploadCloudinaryService,
  ) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    // Adjust the return type as needed
    // Execute the operation within a transaction
    return await this.transactionalService.executeInTransaction(
      async queryRunner => {
        if (file) {
          try {
            createCourseDto.thumbnail_url =
              await this.uploadService.upload(file);
          } catch (error) {
            throw new BadRequestException(`Failed to upload thumbnail`);
          }
        }
        // Create a new course instance
        const course = this.courseRepository.create(createCourseDto);

        // Save the course using the queryRunner's manager to ensure it's part of the transaction
        const savedCourse = await queryRunner.manager.save(course);

        // Check if the users exist
        const usersC: User[] = await this.checkUserExistCourse.checkUser(
          createCourseDto.user,
        );

        // Verify and assign topics to the course
        const topics = await this.topicsService.verifyTopics(
          createCourseDto.topic,
        );
        savedCourse.topics = topics;

        // Assign the users to the course
        savedCourse.users = usersC;

        // Save the updated course within the same transaction
        await queryRunner.manager.save(savedCourse);

        // Build the response object excluding the users field
        const response = {
          id: savedCourse.id,
          name: savedCourse.name,
          description: savedCourse.description,
          thumbnail_url: savedCourse.thumbnail_url,
          slug: savedCourse.slug,
          published_at: savedCourse.published_at,
          topics: savedCourse.topics,
          // Exclude the users field
        };

        return response;
      },
    );
  }
}
