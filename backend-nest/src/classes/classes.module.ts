import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { SectionEntity } from '../database/entities/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolClassEntity, SectionEntity])],
  providers: [ClassesService],
  controllers: [ClassesController],
  exports: [ClassesService],
})
export class ClassesModule {}
