import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeachingAssignmentEntity } from '../database/entities/teaching-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { SubjectEntity } from '../database/entities/subject.entity';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { CreateTeachingAssignmentDto, UpdateTeachingAssignmentDto } from './dto/teaching-assignment.dto';

@Injectable()
export class TeachingAssignmentsService {
  constructor(
    @InjectRepository(TeachingAssignmentEntity) private readonly repo: Repository<TeachingAssignmentEntity>,
    @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(SchoolClassEntity) private readonly classRepo: Repository<SchoolClassEntity>,
    @InjectRepository(SubjectEntity) private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(AcademicYearEntity) private readonly yearRepo: Repository<AcademicYearEntity>,
  ) {}

  async findAll(teacherId?: string) {
    return this.repo.find({ where: teacherId ? { teacherId } : {}, order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateTeachingAssignmentDto) {
    await this.validateReferences(dto);
    const exists = await this.repo.findOne({ where: {
      teacherId: dto.teacherId, classId: dto.classId, section: dto.section,
      subjectId: dto.subjectId, academicYearId: dto.academicYearId,
    } });
    if (exists) throw new BadRequestException('This teaching assignment already exists');
    return this.repo.save(this.repo.create({ ...dto, schoolId: 'school_001', isActive: true }));
  }

  async update(id: string, dto: UpdateTeachingAssignmentDto) {
    const assignment = await this.repo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Teaching assignment not found');
    Object.assign(assignment, dto);
    return this.repo.save(assignment);
  }

  async teacherContext(teacherId: string, academicYearId: number) {
    const rows = await this.repo.find({ where: { teacherId, academicYearId, isActive: true } });
    const [classes, subjects] = await Promise.all([this.classRepo.find(), this.subjectRepo.find()]);
    const classById = new Map(classes.map((value) => [value.id, value]));
    const subjectById = new Map(subjects.map((value) => [value.id, value]));
    return rows.map((row) => ({
      id: row.id,
      classId: row.classId,
      className: classById.get(row.classId)?.name || row.classId,
      section: row.section,
      subjectId: row.subjectId,
      subjectName: subjectById.get(row.subjectId)?.name || row.subjectId,
    }));
  }

  private async validateReferences(dto: CreateTeachingAssignmentDto) {
    const [teacher, schoolClass, subject, academicYear] = await Promise.all([
      this.teacherRepo.findOne({ where: { id: dto.teacherId } }),
      this.classRepo.findOne({ where: { id: dto.classId } }),
      this.subjectRepo.findOne({ where: { id: dto.subjectId } }),
      this.yearRepo.findOne({ where: { id: dto.academicYearId } }),
    ]);
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (!schoolClass) throw new NotFoundException('Class not found');
    if (!subject) throw new NotFoundException('Subject not found');
    if (!academicYear) throw new NotFoundException('Academic year not found');
    if (!schoolClass.sections.includes(dto.section)) throw new BadRequestException('Section does not belong to this class');
    if (!teacher.subjectIds?.includes(dto.subjectId) && teacher.subjectId !== dto.subjectId) {
      throw new BadRequestException('Teacher is not configured for this subject');
    }
  }
}
