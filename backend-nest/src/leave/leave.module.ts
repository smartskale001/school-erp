import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveApplicationEntity } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity } from '../database/entities/proxy-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveApplicationEntity, ProxyAssignmentEntity, TeacherEntity])],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
