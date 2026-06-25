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

@Entity('achievements')
export class AchievementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 100 })
  category: string;

  @Column({ name: 'level', length: 100, nullable: true })
  level: string;

  @Column({ name: 'badge', length: 100, nullable: true })
  badge: string;

  @Column({ name: 'awarded_on', type: 'date', nullable: true })
  awardedOn: Date;

  // The internal UUID of the student (StudentEntity.id)
  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Index()
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  // Human-readable identifier stored at creation time for display
  @Column({ name: 'student_ref_id', length: 20, nullable: true })
  studentRefId: string;

  // Point-in-time snapshot captured at creation (student_id is the FK source of
  // truth). Intentionally not re-synced if the student is renamed/moved.
  @Column({ name: 'student_name', length: 255 })
  studentName: string;

  @Column({ name: 'class_name', length: 100, nullable: true })
  className: string;

  @Column({ name: 'created_by', length: 50, nullable: true })
  createdBy: string;

  @Column({ name: 'created_by_role', length: 50, nullable: true })
  createdByRole: string;

  @Column({ default: false })
  featured: boolean;

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
