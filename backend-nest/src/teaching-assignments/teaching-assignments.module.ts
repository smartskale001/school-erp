import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachingAssignmentEntity } from '../database/entities/teaching-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { SubjectEntity } from '../database/entities/subject.entity';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { TeachingAssignmentsController } from './teaching-assignments.controller';
import { TeachingAssignmentsService } from './teaching-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeachingAssignmentEntity, TeacherEntity, SchoolClassEntity, SubjectEntity, AcademicYearEntity])],
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService],
  exports: [TeachingAssignmentsService],
})
export class TeachingAssignmentsModule {}
