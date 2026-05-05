import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from '../database/entities/task.entity';
import { TaskAssignmentEntity } from '../database/entities/task-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { EmailService } from './email.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity, TaskAssignmentEntity, TeacherEntity, UserEntity]),
    NotificationsModule,
  ],
  providers: [TasksService, EmailService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule { }
