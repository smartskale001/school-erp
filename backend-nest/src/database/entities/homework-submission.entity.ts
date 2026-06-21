import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

export enum HomeworkSubmissionStatus { SUBMITTED = 'submitted', REVIEWED = 'reviewed' }

@Entity('homework_submissions')
@Unique(['homeworkAssignmentId', 'studentId'])
@Index(['homeworkAssignmentId'])
@Index(['studentId', 'status'])
export class HomeworkSubmissionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'homework_assignment_id', type: 'uuid' }) homeworkAssignmentId: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId: string;
  @Column({ name: 'submission_text', type: 'text', nullable: true }) submissionText: string;
  @Column({ name: 'file_url', type: 'text', nullable: true }) fileUrl: string;
  @Column({ name: 'file_name', nullable: true }) fileName: string;
  @Column({ name: 'file_mime_type', nullable: true }) fileMimeType: string;
  @Column({ name: 'file_size', type: 'int', nullable: true }) fileSize: number;
  @Column({ name: 'submitted_at', type: 'timestamptz' }) submittedAt: Date;
  @Column({ name: 'submission_version', default: 1 }) submissionVersion: number;
  @Column({ type: 'varchar', length: 20, default: HomeworkSubmissionStatus.SUBMITTED }) status: HomeworkSubmissionStatus;
  @Column({ name: 'marks_obtained', type: 'numeric', precision: 6, scale: 2, nullable: true }) marksObtained: number;
  @Column({ name: 'teacher_feedback', type: 'text', nullable: true }) teacherFeedback: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
