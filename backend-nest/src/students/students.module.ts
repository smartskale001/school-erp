import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from '../database/entities/student.entity';
import { SectionEntity } from '../database/entities/section.entity';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      SectionEntity,
      AcademicYearEntity,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
