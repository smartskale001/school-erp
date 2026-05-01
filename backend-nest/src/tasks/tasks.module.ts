import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from '../database/entities/task.entity';
import { TaskAssignmentEntity } from '../database/entities/task-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { EmailService } from '../notifications/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskAssignmentEntity, TeacherEntity])],
  providers: [TasksService, EmailService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule { }
