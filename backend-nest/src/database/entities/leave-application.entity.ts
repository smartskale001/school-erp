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
import { SchoolEntity } from './school.entity';
import { TeacherEntity } from './teacher.entity';
import { AcademicYearEntity } from './academic-year.entity';
import { UserEntity } from './user.entity';
import { StudentEntity } from './student.entity';

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leave_applications')
export class LeaveApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AcademicYearEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @Index()
  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @Column({
    type: 'varchar',
    name: 'leave_duration',
    default: 'FULL_DAY',
    length: 20
  })
  leaveDuration: string;

  @Column({
    type: 'decimal',
    name: 'deducted_leaves',
    precision: 4,
    scale: 1,
    default: 1
  })
  deductedLeaves: number;

  @ManyToOne(() => TeacherEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @Index()
  @Column({ name: 'teacher_id', length: 20, nullable: true })
  teacherId: string;

  @ManyToOne(() => StudentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Index()
  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId: string;

  @Column({ name: 'leave_owner_type', length: 10, default: 'teacher' })
  leaveOwnerType: string;

  @Column({ name: 'leave_type', length: 20, default: 'other' })
  leaveType: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Column({ name: 'submitted_at', type: 'timestamptz' })
  submittedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: UserEntity;

  @Index()
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ name: 'proxy_assigned', default: false })
  proxyAssigned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
