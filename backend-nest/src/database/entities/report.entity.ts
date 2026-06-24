import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SchoolEntity } from './school.entity';
import { UserEntity } from './user.entity';
import { AcademicYearEntity } from './academic-year.entity';

@Entity('reports')
export class ReportEntity {
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

  @Column({ length: 50, nullable: true })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @Index()
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
