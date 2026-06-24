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
import { TaskEntity } from './task.entity';
import { TeacherEntity } from './teacher.entity';

export enum TaskAssignmentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('task_assignments')
export class TaskAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @Index()
  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @Index()
  @Column({ name: 'teacher_id', length: 20 })
  teacherId: string;

  @Column({ type: 'varchar', default: TaskAssignmentStatus.NOT_STARTED })
  status: TaskAssignmentStatus;

  @Column({ default: false })
  escalated: boolean;

  @Column({ name: 'escalation_count', default: 0 })
  escalationCount: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
