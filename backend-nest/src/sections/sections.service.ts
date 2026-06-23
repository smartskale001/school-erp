import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../database/entities/section.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto/sections.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(SectionEntity)
    private repo: Repository<SectionEntity>,
    @InjectRepository(SchoolClassEntity)
    private classRepo: Repository<SchoolClassEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
  ) {}

  /** Map of sectionId -> live student count (single grouped query). */
  private async studentCounts(): Promise<Record<string, number>> {
    const rows = await this.studentRepo
      .createQueryBuilder('s')
      .select('s.section_id', 'sectionId')
      .addSelect('COUNT(*)', 'count')
      .where('s.section_id IS NOT NULL')
      .groupBy('s.section_id')
      .getRawMany<{ sectionId: string; count: string }>();
    return rows.reduce((acc, r) => {
      acc[r.sectionId] = Number(r.count);
      return acc;
    }, {} as Record<string, number>);
  }

  private shape(s: SectionEntity, counts: Record<string, number>) {
    return {
      id: s.id,
      classId: s.classId,
      className: s.class?.name ?? null,
      name: s.name,
      capacity: s.capacity,
      classTeacherId: s.classTeacherId,
      classTeacherName: s.classTeacher?.name ?? null,
      roomId: s.roomId,
      roomName: s.room?.name ?? null,
      studentCount: counts[s.id] ?? 0,
      schoolId: s.schoolId,
    };
  }

  async findAll(schoolId = 'school_001') {
    const sections = await this.repo.find({
      where: { schoolId },
      relations: { class: true },
      order: { id: 'ASC' },
    });
    const counts = await this.studentCounts();
    return sections.map((s) => this.shape(s, counts));
  }

  async findOne(id: string) {
    const section = await this.repo.findOne({
      where: { id },
      relations: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    const counts = await this.studentCounts();
    const roster = await this.studentRepo.find({
      where: { sectionId: id },
      order: { fullName: 'ASC' },
    });
    return {
      ...this.shape(section, counts),
      students: roster.map((st) => ({
        id: st.id,
        studentId: st.studentId,
        name: st.fullName,
      })),
    };
  }

  async create(dto: CreateSectionDto) {
    const cls = await this.classRepo.findOne({ where: { id: dto.classId } });
    if (!cls) throw new NotFoundException('Parent class not found');

    const id = `${dto.classId}-${dto.name}`;
    const existing = await this.repo.findOne({ where: { id } });
    if (existing) throw new ConflictException('Section already exists');

    const entity = this.repo.create({
      id,
      classId: dto.classId,
      name: dto.name,
      capacity: dto.capacity ?? 40,
      classTeacherId: dto.classTeacherId || null,
      roomId: null, // assigned via assignRoom() so the one-room-per-section rule holds
      schoolId: dto.schoolId || cls.schoolId || 'school_001',
    });
    const saved = await this.repo.save(entity);

    // Keep the parent class's denormalized sections[] mirror in sync.
    if (!cls.sections.includes(dto.name)) {
      cls.sections = [...cls.sections, dto.name];
      await this.classRepo.save(cls);
    }

    if (dto.classTeacherId) {
      await this.syncClassTeacher(saved.id, dto.classTeacherId);
    }
    if (dto.roomId) {
      await this.assignRoom(saved.id, dto.roomId);
    }
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateSectionDto) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');

    if (dto.capacity !== undefined) section.capacity = dto.capacity;

    if (dto.classTeacherId !== undefined) {
      const next = dto.classTeacherId || null;
      const prev = section.classTeacherId;
      section.classTeacherId = next;
      await this.repo.save(section);
      if (prev && prev !== next) await this.clearClassTeacher(prev, id);
      if (next) await this.syncClassTeacher(id, next);
    } else {
      await this.repo.save(section);
    }

    // Homeroom changes go through assignRoom() to enforce one section per room.
    if (dto.roomId !== undefined) {
      await this.assignRoom(id, dto.roomId || null);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const section = await this.repo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    if (section.classTeacherId) {
      await this.clearClassTeacher(section.classTeacherId, id);
    }
    await this.repo.delete(id);

    // Mirror removal from the parent class's sections[].
    const cls = await this.classRepo.findOne({ where: { id: section.classId } });
    if (cls && cls.sections.includes(section.name)) {
      cls.sections = cls.sections.filter((s) => s !== section.name);
      await this.classRepo.save(cls);
    }
  }

  /**
   * Set a section's homeroom, enforcing that a room is the homeroom of at most
   * one section. Passing null clears it. Reassigning a room moves it (the
   * section that previously held it is released).
   */
  private async assignRoom(sectionId: string, roomId: string | null) {
    if (roomId) {
      await this.repo
        .createQueryBuilder()
        .update(SectionEntity)
        .set({ roomId: null })
        .where('room_id = :roomId AND id != :sectionId', { roomId, sectionId })
        .execute();
    }
    await this.repo.update(sectionId, { roomId });
  }

  /** Back-compat: mark a teacher as the class teacher of this section. */
  private async syncClassTeacher(sectionId: string, teacherId: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher) return;
    // A teacher can be class teacher of only one section — release any other.
    await this.repo
      .createQueryBuilder()
      .update(SectionEntity)
      .set({ classTeacherId: null })
      .where('class_teacher_id = :teacherId AND id != :sectionId', {
        teacherId,
        sectionId,
      })
      .execute();
    teacher.isClassTeacher = true;
    teacher.classTeacherClassId = sectionId;
    await this.teacherRepo.save(teacher);
  }

  /** Back-compat: clear class-teacher flags when a teacher is unassigned. */
  private async clearClassTeacher(teacherId: string, sectionId: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher) return;
    if (teacher.classTeacherClassId === sectionId) {
      teacher.isClassTeacher = false;
      teacher.classTeacherClassId = null;
      await this.teacherRepo.save(teacher);
    }
  }
}
