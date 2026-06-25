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
import { UserEntity } from './user.entity';
import { AcademicYearEntity } from './academic-year.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AcademicYearEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @Index()
  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @Index()
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  // Client-supplied display label (e.g. 'School Administration'), NOT a mirror of
  // users.name — kept deliberately. created_by is the FK to the real author.
  @Column({ name: 'created_by_name', length: 255, nullable: true })
  createdByName: string;

  @Column({ type: 'varchar', default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column('text', { array: true, name: 'assigned_to', default: [] })
  assignedTo: string[];

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
