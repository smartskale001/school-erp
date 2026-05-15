import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from '../database/entities/attendance.entity';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { AcademicYearsService } from '../academic-years/academic-years.service';

interface CurrentUser { id: string; teacherId: string; }

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private repo: Repository<AttendanceEntity>,
    private academicYearService: AcademicYearsService,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { date: 'DESC' } });
  }

  async findOne(id: string) {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Attendance record not found');
    return a;
  }

  async mark(dto: MarkAttendanceDto, user: CurrentUser) {
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    const entity = this.repo.create({
      ...dto,
      markedBy: user.id,
      markedAt: new Date(),
      schoolId: 'school_001',
      academicYearId: activeYear.id,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}
