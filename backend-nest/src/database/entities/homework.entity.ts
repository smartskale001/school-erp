import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SchoolEntity } from './school.entity';
import { TeacherEntity } from './teacher.entity';
import { SchoolClassEntity } from './class.entity';
import { SubjectEntity } from './subject.entity';
import { AcademicYearEntity } from './academic-year.entity';

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
  // *_name columns are intentional point-in-time snapshots captured at creation
  // (same rationale as messages/mailbox sender_name). The *_id columns are the
  // FK source of truth; the names are NOT kept in sync if the parent is renamed.
  @ManyToOne(() => SchoolClassEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'class_id' }) class: SchoolClassEntity;
  @Column({ name: 'class_id', length: 20 }) classId: string;
  @Column({ name: 'class_name', length: 100 }) className: string;
  @ManyToOne(() => SubjectEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'subject_id' }) subject: SubjectEntity;
  @Index() @Column({ name: 'subject_id', length: 20 }) subjectId: string;
  @Column({ name: 'subject_name', length: 100 }) subjectName: string;
  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'teacher_id' }) teacher: TeacherEntity;
  @Column({ name: 'teacher_id', length: 20 }) teacherId: string;
  @Column({ name: 'teacher_name', length: 255 }) teacherName: string;
  @ManyToOne(() => AcademicYearEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'academic_year_id' }) academicYear: AcademicYearEntity;
  @Index() @Column({ name: 'academic_year_id', type: 'int' }) academicYearId: number;
  @Column({ name: 'attachment_url', type: 'text', nullable: true }) attachmentUrl: string;
  @Column({ name: 'attachment_name', nullable: true }) attachmentName: string;
  @Column({ name: 'attachment_mime_type', nullable: true }) attachmentMimeType: string;
  @Column({ name: 'attachment_size', type: 'int', nullable: true }) attachmentSize: number;
  @Column({ type: 'varchar', length: 20, default: HomeworkStatus.PUBLISHED }) status: HomeworkStatus;
  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'school_id' }) school: SchoolEntity;
  @Index() @Column({ name: 'school_id', default: 'school_001', length: 50 }) schoolId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
