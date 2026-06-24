import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SchoolEntity } from './school.entity';
import { TeacherEntity } from './teacher.entity';
import { AcademicYearEntity } from './academic-year.entity';

@Entity('teacher_leave_balances')
@Unique(['teacherId', 'academicYearId'])
export class TeacherLeaveBalanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @Column({ name: 'teacher_id', length: 20 })
  teacherId: string;

  @ManyToOne(() => AcademicYearEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @Index()
  @Column({ name: 'academic_year_id' })
  academicYearId: number;

  @Column({
    type: 'decimal',
    name: 'total_leaves',
    precision: 5,
    scale: 1,
    default: 20
  })
  totalLeaves: number;

  @Column({
    type: 'decimal',
    name: 'used_leaves',
    precision: 5,
    scale: 1,
    default: 0
  })
  usedLeaves: number;

  @Column({
    type: 'decimal',
    name: 'remaining_leaves',
    precision: 5,
    scale: 1,
    default: 20
  })
  remainingLeaves: number;

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
