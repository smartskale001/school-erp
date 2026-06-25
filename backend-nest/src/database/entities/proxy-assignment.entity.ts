import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LeaveApplicationEntity } from './leave-application.entity';
import { TeacherEntity } from './teacher.entity';
import { SchoolClassEntity } from './class.entity';
import { SubjectEntity } from './subject.entity';
import { PeriodEntity } from './period.entity';
import { UserEntity } from './user.entity';

export enum ProxyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('proxy_assignments')
export class ProxyAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LeaveApplicationEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'leave_application_id' })
  leaveApplication: LeaveApplicationEntity;

  @Index()
  @Column({ name: 'leave_application_id', type: 'uuid', nullable: true })
  leaveApplicationId: string;

  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'original_teacher_id' })
  originalTeacher: TeacherEntity;

  @Index()
  @Column({ name: 'original_teacher_id', length: 20, nullable: true })
  originalTeacherId: string;

  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'proxy_teacher_id' })
  proxyTeacher: TeacherEntity;

  @Index()
  @Column({ name: 'proxy_teacher_id', length: 20, nullable: true })
  proxyTeacherId: string;

  @ManyToOne(() => SchoolClassEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClassEntity;

  @Index()
  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @ManyToOne(() => SubjectEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;

  @Index()
  @Column({ name: 'subject_id', length: 20 })
  subjectId: string;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => PeriodEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'period_id' })
  period: PeriodEntity;

  @Index()
  @Column({ name: 'period_id', length: 20, nullable: true })
  periodId: string;

  @Column({ type: 'varchar', default: ProxyStatus.PENDING })
  status: ProxyStatus;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: UserEntity;

  @Index()
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
