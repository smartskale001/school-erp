import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceEntity } from '../database/entities/attendance.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity]), AcademicYearsModule],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
