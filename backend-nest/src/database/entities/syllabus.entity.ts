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
import { SchoolClassEntity } from './class.entity';
import { SubjectEntity } from './subject.entity';
import { TeacherEntity } from './teacher.entity';
import { AcademicYearEntity } from './academic-year.entity';

@Entity('syllabus')
export class SyllabusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SchoolClassEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClassEntity;

  @Index()
  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @Column({ name: 'class_name', length: 100 })
  className: string;

  @ManyToOne(() => SubjectEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;

  @Index()
  @Column({ name: 'subject_id', length: 20 })
  subjectId: string;

  @Column({ name: 'subject_name', length: 100 })
  subjectName: string;

  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @Index()
  @Column({ name: 'teacher_id', length: 20 })
  teacherId: string;

  @Column({ name: 'teacher_name', length: 255 })
  teacherName: string;

  @Column({ name: 'total_chapters', default: 0 })
  totalChapters: number;

  @Column({ name: 'completed_chapters', default: 0 })
  completedChapters: number;

  @Column({ name: 'completion_percentage', type: 'float', default: 0 })
  completionPercentage: number;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @ManyToOne(() => AcademicYearEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @Index()
  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
