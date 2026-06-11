import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('syllabus')
export class SyllabusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_id' })
  classId: string;

  @Column({ name: 'class_name', length: 100 })
  className: string;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @Column({ name: 'subject_name', length: 100 })
  subjectName: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @Column({ name: 'teacher_name', length: 255 })
  teacherName: string;

  @Column({ name: 'total_chapters', default: 0 })
  totalChapters: number;

  @Column({ name: 'completed_chapters', default: 0 })
  completedChapters: number;

  @Column({ name: 'completion_percentage', type: 'float', default: 0 })
  completionPercentage: number;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
