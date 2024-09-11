/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FindUserRecommendedCoursesService } from './services/find-user-recommended-courses.service';
import { CreateCourseService } from './services/create-courses/create-course.service';
import { Course } from './entities/course.entity';
import { FindAllCourses } from './services/get-all-courses/get-all-courses.service';

@Injectable()
export class CourseService {
  constructor(
    private findUserRecommendedCoursesService: FindUserRecommendedCoursesService,
    private readonly createCourseService: CreateCourseService,
    private readonly findAllCourses: FindAllCourses,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    userId: number,
    file?: Express.Multer.File,
  ) {
    createCourseDto.user = userId;
    return await this.createCourseService.createCourse(createCourseDto, file);
  }

  findUserRecommendedCourses(id: string): Promise<any> {
    return this.findUserRecommendedCoursesService.FindUserRecommendedCourses(
      id,
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  async findAll(): Promise<Course[]> {
    return await this.findAllCourses.getAll();
  }
}
