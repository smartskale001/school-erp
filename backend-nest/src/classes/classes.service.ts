import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { SectionEntity } from '../database/entities/section.entity';
import { CreateClassDto, UpdateClassDto } from './dto/classes.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(SchoolClassEntity)
    private repo: Repository<SchoolClassEntity>,
    @InjectRepository(SectionEntity)
    private sectionRepo: Repository<SectionEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Class not found');
    return c;
  }

  async create(dto: CreateClassDto) {
    const id = dto.id || `CLS${randomUUID().replace(/-/g, '').slice(0, 17)}`;
    const schoolId = dto.schoolId || 'school_001';
    const entity = this.repo.create({ ...dto, id, schoolId });
    const saved = await this.repo.save(entity);
    await this.syncSections(saved.id, schoolId, [], saved.sections || []);
    return saved;
  }

  async update(id: string, dto: UpdateClassDto) {
    const current = await this.findOne(id);
    await this.repo.update(id, dto);
    if (dto.sections) {
      await this.syncSections(id, current.schoolId, current.sections || [], dto.sections);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    // Section rows are removed via the onDelete: CASCADE FK on section.classId.
    await this.repo.delete(id);
  }

  /** Create/delete Section rows so they mirror the class's sections[] array. */
  private async syncSections(
    classId: string,
    schoolId: string,
    prev: string[],
    next: string[],
  ) {
    const toAdd = next.filter((s) => !prev.includes(s));
    const toRemove = prev.filter((s) => !next.includes(s));

    for (const name of toAdd) {
      const sectionId = `${classId}-${name}`;
      const exists = await this.sectionRepo.findOne({ where: { id: sectionId } });
      if (!exists) {
        await this.sectionRepo.save(
          this.sectionRepo.create({ id: sectionId, classId, name, schoolId }),
        );
      }
    }

    for (const name of toRemove) {
      await this.sectionRepo.delete(`${classId}-${name}`);
    }
  }
}
