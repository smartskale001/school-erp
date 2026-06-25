import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../database/entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  async getStudentsByClass(classId: string) {
    // Prefer filtering by the real section FK. If no students are linked to
    // this section yet (e.g. legacy/mock ids), fall back to returning all
    // students so existing flows (attendance) keep working.
    const scoped = await this.studentRepo.find({
      where: { sectionId: classId },
      order: { fullName: 'ASC' },
    });

    const students = scoped.length
      ? scoped
      : await this.studentRepo.find({ order: { fullName: 'ASC' } });

    return students.map((s) => ({
      id: s.id,
      studentId: s.studentId, // e.g. ST101 — this is what attendance.studentId stores
      name: s.fullName,
      className: s.className,
      section: s.section,
    }));
  }

  /** Live student count for a section (used by class-management). */
  countBySection(sectionId: string) {
    return this.studentRepo.count({ where: { sectionId } });
  }

  async findAll() {
    let students = await this.studentRepo.find({
      order: { fullName: 'ASC' }
    });

    return students.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      name: s.fullName,
      className: s.className,
      section: s.section,
      class: s.className // For frontend compatibility
    }));
  }
}
