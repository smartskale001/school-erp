import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkEntity } from '../database/entities/homework.entity';
import { HomeworkAssignmentEntity } from '../database/entities/homework-assignment.entity';
import { HomeworkSubmissionEntity } from '../database/entities/homework-submission.entity';
import { TeachingAssignmentEntity } from '../database/entities/teaching-assignment.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { SubjectEntity } from '../database/entities/subject.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { AcademicYearsModule } from '../academic-years/academic-years.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeworkEntity, HomeworkAssignmentEntity, HomeworkSubmissionEntity, TeachingAssignmentEntity, StudentEntity, TeacherEntity, SubjectEntity, SchoolClassEntity]),
    AcademicYearsModule,
  ],
  controllers: [HomeworkController],
  providers: [HomeworkService],
})
export class HomeworkModule {}
