import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../database/entities/subject.entity';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(SubjectEntity)
    private repo: Repository<SubjectEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Subject not found');
    return s;
  }

  async create(dto: CreateSubjectDto) {
    const id = dto.id || `SUB${randomUUID().replace(/-/g, '').slice(0, 17)}`;
    const code = dto.code || dto.name.slice(0, 4).toUpperCase();
    const entity = this.repo.create({ ...dto, id, code, schoolId: dto.schoolId || 'school_001' });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
