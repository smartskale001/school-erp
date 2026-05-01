import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplicationEntity, LeaveStatus } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity, ProxyStatus } from '../database/entities/proxy-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { SubmitLeaveDto, ReviewLeaveDto, CreateProxyDto } from './dto/leave.dto';
import { Role } from '../common/enums/role.enum';

interface CurrentUser { id: string; role: Role; teacherId: string; }

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveApplicationEntity)
    private leaveRepo: Repository<LeaveApplicationEntity>,
    @InjectRepository(ProxyAssignmentEntity)
    private proxyRepo: Repository<ProxyAssignmentEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  private async getTeacherId(user: any): Promise<string> {
    if (user.teacherId) return user.teacherId;
    const teacher = await this.teacherRepo.findOne({ where: { email: user.email } });
    if (teacher) return teacher.id;
    return user.id;
  }

  // ─── Leave ────────────────────────────────────────────────────────────────

  async findAll(user: any) {
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR].includes(user.role);
    let leaves: LeaveApplicationEntity[];
    if (isPrivileged) {
      leaves = await this.leaveRepo.find({ order: { submittedAt: 'DESC' } });
    } else {
      const teacherId = await this.getTeacherId(user);
      leaves = await this.leaveRepo.find({
        where: { teacherId },
        order: { submittedAt: 'DESC' },
      });
    }

    const teachers = await this.teacherRepo.find();
    const users = await this.userRepo.find();

    return leaves.map((leave) => {
      const teacher = teachers.find(t => t.id === leave.teacherId || t.email === leave.teacherId);
      const userRec = users.find(u => u.id === leave.teacherId || u.teacherId === leave.teacherId);
      const teacherName = teacher?.name || userRec?.name || 'Unknown Teacher';

      return {
        ...leave,
        teacherName,
        teacher: {
          id: teacher?.id || leave.teacherId,
          name: teacherName,
          full_name: teacherName,
          email: teacher?.email || userRec?.email,
          subject: teacher?.subjectNames?.[0] || '',
        },
      };
    });
  }

  async findOne(id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');

    const teachers = await this.teacherRepo.find();
    const users = await this.userRepo.find();

    const teacher = teachers.find(t => t.id === leave.teacherId || t.email === leave.teacherId);
    const userRec = users.find(u => u.id === leave.teacherId || u.teacherId === leave.teacherId);
    const teacherName = teacher?.name || userRec?.name || 'Unknown Teacher';

    return {
      ...leave,
      teacherName,
      teacher: {
        id: teacher?.id || leave.teacherId,
        name: teacherName,
        full_name: teacherName,
        email: teacher?.email || userRec?.email,
        subject: teacher?.subjectNames?.[0] || '',
      },
    };
  }

  async submit(dto: SubmitLeaveDto, user: any) {
    const teacherId = await this.getTeacherId(user);
    const entity = this.leaveRepo.create({
      teacherId,
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
      status: LeaveStatus.PENDING,
      submittedAt: new Date(),
      schoolId: user.schoolId || 'school_001',
    });
    return this.leaveRepo.save(entity);
  }

  async approve(id: string, user: CurrentUser) {
    const leave = await this.findOne(id);
    await this.leaveRepo.update(id, {
      status: LeaveStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findOne(id);
  }

  async reject(id: string, dto: ReviewLeaveDto, user: CurrentUser) {
    await this.findOne(id);
    await this.leaveRepo.update(id, {
      status: LeaveStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: dto.remarks,
    });
    return this.findOne(id);
  }

  // ─── Proxy ────────────────────────────────────────────────────────────────

  findAllProxies() {
    return this.proxyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findProxy(id: string) {
    const p = await this.proxyRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Proxy assignment not found');
    return p;
  }

  async createProxy(dto: CreateProxyDto, user: CurrentUser) {
    const entity = this.proxyRepo.create({
      ...dto,
      status: ProxyStatus.PENDING,
    });
    return this.proxyRepo.save(entity);
  }

  async approveProxy(id: string, user: CurrentUser) {
    await this.findProxy(id);
    await this.proxyRepo.update(id, {
      status: ProxyStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findProxy(id);
  }

  async rejectProxy(id: string, user: CurrentUser) {
    await this.findProxy(id);
    await this.proxyRepo.update(id, {
      status: ProxyStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
    });
    return this.findProxy(id);
  }
}
