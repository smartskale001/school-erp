import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { HomeworkEntity } from '../database/entities/homework.entity';
import { StudentHomeworkEntity } from '../database/entities/student-homework.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { UserEntity } from '../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AcademicYearsModule } from '../academic-years/academic-years.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeworkEntity,
      StudentHomeworkEntity,
      StudentEntity,
      UserEntity,
    ]),
    NotificationsModule,
    AcademicYearsModule,
  ],
  providers: [HomeworkService],
  controllers: [HomeworkController],
  exports: [HomeworkService],
})
export class HomeworkModule {}
