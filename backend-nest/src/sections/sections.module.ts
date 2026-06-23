import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { SectionEntity } from '../database/entities/section.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SectionEntity,
      SchoolClassEntity,
      StudentEntity,
      TeacherEntity,
    ]),
  ],
  providers: [SectionsService],
  controllers: [SectionsController],
  exports: [SectionsService],
})
export class SectionsModule {}
