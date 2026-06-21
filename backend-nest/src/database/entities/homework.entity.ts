import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum HomeworkStatus {
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum HomeworkSubmissionType {
  TEXT = 'text',
  FILE = 'file',
  BOTH = 'both',
}

@Entity('homework')
@Index(['teacherId', 'academicYearId'])
@Index(['classId', 'subjectId', 'academicYearId'])
export class HomeworkEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 255 }) title: string;
  @Column({ type: 'text' }) description: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) topic: string;
  @Column({ type: 'varchar', length: 20, default: 'medium' }) priority: string;
  @Column({ name: 'submission_type', type: 'varchar', length: 10 }) submissionType: HomeworkSubmissionType;
  @Column({ name: 'class_id', length: 20 }) classId: string;
  @Column({ name: 'class_name', length: 100 }) className: string;
  @Column({ name: 'subject_id', length: 20 }) subjectId: string;
  @Column({ name: 'subject_name', length: 100 }) subjectName: string;
  @Column({ name: 'teacher_id', length: 20 }) teacherId: string;
  @Column({ name: 'teacher_name', length: 255 }) teacherName: string;
  @Column({ name: 'academic_year_id', type: 'int' }) academicYearId: number;
  @Column({ name: 'attachment_url', type: 'text', nullable: true }) attachmentUrl: string;
  @Column({ name: 'attachment_name', nullable: true }) attachmentName: string;
  @Column({ name: 'attachment_mime_type', nullable: true }) attachmentMimeType: string;
  @Column({ name: 'attachment_size', type: 'int', nullable: true }) attachmentSize: number;
  @Column({ type: 'varchar', length: 20, default: HomeworkStatus.PUBLISHED }) status: HomeworkStatus;
  @Column({ name: 'school_id', default: 'school_001', length: 50 }) schoolId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
