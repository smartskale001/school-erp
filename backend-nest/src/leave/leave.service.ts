import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplicationEntity, LeaveStatus } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity, ProxyStatus } from '../database/entities/proxy-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { SubmitLeaveDto, ReviewLeaveDto, CreateProxyDto } from './dto/leave.dto';
import { Role } from '../common/enums/role.enum';
import { EmailService } from '../tasks/email.service';

interface CurrentUser {
  id: string;
  role: Role;
  teacherId?: string;
  email?: string;
  schoolId?: string;
}

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
    private emailService: EmailService,
  ) {}

  private async getTeacherId(user: CurrentUser): Promise<string> {
    if (user.teacherId) return user.teacherId;
    if (user.email) {
      const teacher = await this.teacherRepo.findOne({ where: { email: user.email } });
      if (teacher) return teacher.id;
    }
    return user.id;
  }

  private async attachTeacherDetails<T extends { teacherId?: string }>(record: T) {
    const teachers = await this.teacherRepo.find();
    const users = await this.userRepo.find();

    const teacher = teachers.find((t) => t.id === record.teacherId || t.email === record.teacherId);
    const userRec = users.find((u) => u.id === record.teacherId || u.teacherId === record.teacherId);
    const teacherName = teacher?.name || userRec?.name || 'Unknown Teacher';

    return {
      ...record,
      teacherName,
      teacher: {
        id: teacher?.id || record.teacherId,
        name: teacherName,
        full_name: teacherName,
        email: teacher?.email || userRec?.email,
        subject: teacher?.subjectNames?.[0] || '',
      },
    };
  }

  async findAll(user: CurrentUser) {
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR].includes(user.role);
    const where = isPrivileged ? {} : { teacherId: await this.getTeacherId(user) };
    const leaves = await this.leaveRepo.find({
      where,
      order: { submittedAt: 'DESC' },
    });

    return Promise.all(leaves.map((leave) => this.attachTeacherDetails(leave)));
  }

  async findOne(id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');
    return this.attachTeacherDetails(leave);
  }

  async submit(dto: SubmitLeaveDto, user: CurrentUser) {
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
    const saved = await this.leaveRepo.save(entity);

    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    const coordinators = await this.userRepo.find({
      where: [
        { role: Role.ADMIN, schoolId: user.schoolId || 'school_001' },
        { role: Role.PRINCIPAL, schoolId: user.schoolId || 'school_001' },
        { role: Role.COORDINATOR, schoolId: user.schoolId || 'school_001' },
      ],
    });
    coordinators.forEach((approver) => {
      this.emailService.sendLeaveApplicationNotification(
        approver.email,
        approver.name,
        teacher?.name || user.email || 'Teacher',
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.reason || 'No reason provided'
      );
    });

    return saved;
  }

  async approve(id: string, user: CurrentUser) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');

    await this.leaveRepo.update(id, {
      status: LeaveStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: null,
    });

    const updated = await this.findOne(id);
    if (updated.teacher?.email) {
      this.emailService.sendLeaveStatusNotification(
        updated.teacher.email,
        updated.teacher.name,
        LeaveStatus.APPROVED,
        new Date(leave.startDate),
        new Date(leave.endDate)
      );
    }
    return updated;
  }

  async reject(id: string, dto: ReviewLeaveDto, user: CurrentUser) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');

    await this.leaveRepo.update(id, {
      status: LeaveStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: dto.remarks || null,
    });

    const updated = await this.findOne(id);
    if (updated.teacher?.email) {
      this.emailService.sendLeaveStatusNotification(
        updated.teacher.email,
        updated.teacher.name,
        LeaveStatus.REJECTED,
        new Date(leave.startDate),
        new Date(leave.endDate)
      );
    }
    return updated;
  }

  async findAllProxies() {
    return this.proxyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createProxy(dto: CreateProxyDto, user: CurrentUser) {
    if (dto.originalTeacherId === dto.proxyTeacherId) {
      throw new BadRequestException('Proxy teacher must be different from the original teacher');
    }

    const entity = this.proxyRepo.create({
      leaveApplicationId: dto.leaveApplicationId || null,
      originalTeacherId: dto.originalTeacherId,
      proxyTeacherId: dto.proxyTeacherId,
      classId: dto.classId,
      subjectId: dto.subjectId,
      date: dto.date,
      periodId: dto.periodId || null,
      status: ProxyStatus.PENDING,
      approvedBy: user.id,
    });
    return this.proxyRepo.save(entity);
  }

  async approveProxy(id: string, user: CurrentUser) {
    const proxy = await this.proxyRepo.findOne({ where: { id } });
    if (!proxy) throw new NotFoundException('Proxy assignment not found');

    await this.proxyRepo.update(id, {
      status: ProxyStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: user.id,
    });
    return this.proxyRepo.findOne({ where: { id } });
  }

  async rejectProxy(id: string, user: CurrentUser) {
    const proxy = await this.proxyRepo.findOne({ where: { id } });
    if (!proxy) throw new NotFoundException('Proxy assignment not found');

    await this.proxyRepo.update(id, {
      status: ProxyStatus.REJECTED,
      approvedAt: new Date(),
      approvedBy: user.id,
    });
    return this.proxyRepo.findOne({ where: { id } });
  }
}
