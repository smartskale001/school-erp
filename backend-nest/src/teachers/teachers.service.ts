import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teachers.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private repo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Teacher not found');
    return t;
  }

  async create(dto: CreateTeacherDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const existingTeacher = await this.repo.findOne({ where: { email: dto.email } });
    if (existingTeacher) throw new ConflictException('A teacher with this email already exists');

    const { password, ...teacherData } = dto;
    const id = teacherData.id || `TCH${randomUUID().replace(/-/g, '').slice(0, 17)}`;
    const employeeCode = teacherData.employeeCode || `EMP${Date.now()}`.slice(0, 20);

    const entity = this.repo.create({
      ...teacherData,
      id,
      employeeCode,
      schoolId: teacherData.schoolId || 'school_001',
    });
    const savedTeacher = await this.repo.save(entity);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.TEACHER,
      teacherId: savedTeacher.id,
      schoolId: teacherData.schoolId || 'school_001',
    });
    await this.userRepo.save(user);

    return savedTeacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);

    const userUpdates: Partial<UserEntity> = {};
    if (dto.name) userUpdates.name = dto.name;
    if (dto.email) userUpdates.email = dto.email;
    if (Object.keys(userUpdates).length) {
      await this.userRepo.update({ teacherId: id }, userUpdates);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.delete({ teacherId: id });
    await this.repo.delete(id);
  }
}
