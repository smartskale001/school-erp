import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyllabusService } from './syllabus.service';
import { SyllabusController } from './syllabus.controller';
import { SyllabusEntity } from '../database/entities/syllabus.entity';
import { SyllabusChapterEntity } from '../database/entities/syllabus-chapter.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SyllabusEntity,
      SyllabusChapterEntity,
    ]),
    AcademicYearsModule,
  ],
  providers: [SyllabusService],
  controllers: [SyllabusController],
  exports: [SyllabusService],
})
export class SyllabusModule {}
