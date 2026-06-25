import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { StudentEntity } from '../database/entities/student.entity';
import { SectionEntity } from '../database/entities/section.entity';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { EnrollmentStatus } from './enums/enrollment-status.enum';

/** Fixed initial password; student is forced to change it after first login. */
export const DEFAULT_STUDENT_PASSWORD = 'Student@123';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
    @InjectRepository(AcademicYearEntity)
    private academicYearRepo: Repository<AcademicYearEntity>,
    private config: ConfigService,
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

  /** Single student detail (by internal UUID). Strips secrets. */
  async findOne(id: string) {
    const s = await this.studentRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Student not found');
    const { passwordHash, refreshTokenHash, ...safe } = s;
    return { ...safe, admissionNo: s.studentId };
  }

  /**
   * Enroll (create) a student. Issues a permanent Admission Number, assigns a
   * per-section roll number, and sets the fixed initial password.
   */
  async create(dto: CreateStudentDto) {
    const section = await this.sectionRepo.findOne({
      where: { id: dto.sectionId },
      relations: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    if (dto.email) {
      const dup = await this.studentRepo.findOne({ where: { email: dto.email } });
      if (dup) throw new ConflictException('Email already in use');
    }

    const prefix = this.config.get<string>('ADMISSION_PREFIX', 'JS');
    const year = await this.resolveAdmissionYear();
    const passwordHash = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 12);
    const admissionDate =
      dto.admissionDate ?? new Date().toISOString().split('T')[0];

    const saved = await this.studentRepo.manager.transaction(async (mgr) => {
      const repo = mgr.getRepository(StudentEntity);
      const admissionNo = await this.nextAdmissionNumber(mgr, prefix, year);
      const rollNo = dto.rollNo ?? (await this.nextRollNo(mgr, section.id));

      const entity = repo.create({
        studentId: admissionNo,
        fullName: dto.fullName,
        email: dto.email ?? null,
        passwordHash,
        className: section.class?.name ?? '',
        section: section.name,
        sectionId: section.id,
        rollNo,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender ?? null,
        admissionDate,
        guardianName: dto.guardianName ?? null,
        guardianPhone: dto.guardianPhone ?? null,
        guardianEmail: dto.guardianEmail ?? null,
        contactPhone: dto.contactPhone ?? null,
        address: dto.address ?? null,
        bloodGroup: dto.bloodGroup ?? null,
        status: EnrollmentStatus.ACTIVE,
        mustChangePassword: true,
      });
      return repo.save(entity);
    });

    return {
      id: saved.id,
      admissionNo: saved.studentId,
      rollNo: saved.rollNo,
      fullName: saved.fullName,
      className: saved.className,
      section: saved.section,
      sectionId: saved.sectionId,
      status: saved.status,
      mustChangePassword: saved.mustChangePassword,
      tempPassword: DEFAULT_STUDENT_PASSWORD,
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /** Year for the admission number: active academic year's start, else current. */
  private async resolveAdmissionYear(): Promise<number> {
    const active = await this.academicYearRepo.findOne({
      where: { isActive: true },
    });
    if (active?.startDate) {
      const y = new Date(active.startDate).getFullYear();
      if (!Number.isNaN(y)) return y;
    }
    return new Date().getFullYear();
  }

  /**
   * Next admission number `${prefix}-${year}-${seq4}`. Computed inside the
   * caller's transaction; the unique constraint on `studentId` is the final
   * guard against a concurrent collision.
   */
  private async nextAdmissionNumber(
    mgr: EntityManager,
    prefix: string,
    year: number,
  ): Promise<string> {
    const like = `${prefix}-${year}-%`;
    const rows = await mgr
      .getRepository(StudentEntity)
      .createQueryBuilder('s')
      .select('s.studentId', 'studentId')
      .where('s.studentId LIKE :like', { like })
      .getRawMany<{ studentId: string }>();

    let maxSeq = 0;
    for (const r of rows) {
      const seq = parseInt(r.studentId.split('-').pop() ?? '0', 10);
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
    return `${prefix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
  }

  /** Next roll number within a section (max + 1). */
  private async nextRollNo(
    mgr: EntityManager,
    sectionId: string,
  ): Promise<number> {
    const row = await mgr
      .getRepository(StudentEntity)
      .createQueryBuilder('s')
      .select('MAX(s.rollNo)', 'max')
      .where('s.section_id = :sectionId', { sectionId })
      .getRawOne<{ max: string | null }>();
    return (row?.max ? Number(row.max) : 0) + 1;
  }
}
