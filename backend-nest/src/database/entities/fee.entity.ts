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
import { StudentEntity } from './student.entity';

export enum FeeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity('fees')
export class FeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Index()
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', default: FeeStatus.PENDING })
  status: FeeStatus;

  @Column({ length: 255, nullable: true })
  description: string;

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
