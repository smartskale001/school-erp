import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TimetableEntity } from '../database/entities/timetable.entity';
import { TimetableSettingsEntity } from '../database/entities/timetable-settings.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { EmailService } from '../tasks/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimetableEntity, TimetableSettingsEntity, TeacherEntity])],
  providers: [TimetableService, EmailService],
  controllers: [TimetableController],
  exports: [TimetableService],
})
export class TimetableModule {}
