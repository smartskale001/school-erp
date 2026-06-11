import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HomeworkStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('homework')
export class HomeworkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @Column({ name: 'subject_name', length: 100 })
  subjectName: string;

  @Column({ name: 'class_id' })
  classId: string;

  @Column({ name: 'class_name', length: 100 })
  className: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @Column({ name: 'teacher_name', length: 255 })
  teacherName: string;

  @Column({ name: 'attachment_url', type: 'text', nullable: true })
  attachmentUrl: string;

  @Column({ name: 'assigned_date', type: 'date' })
  assignedDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'varchar', default: HomeworkStatus.ACTIVE })
  status: string;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
