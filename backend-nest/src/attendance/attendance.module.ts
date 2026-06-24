import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from '../database/entities/attendance.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceEntity, StudentEntity]),
    AuthModule
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
