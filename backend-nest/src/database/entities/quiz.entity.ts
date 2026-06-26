import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

// Enum — restricts status to these 3 values only
export enum QuizStatus {
  DRAFT     = 'draft',
  LIVE      = 'live',
  COMPLETED = 'completed',
}

// @Entity('quizzes') maps this class to the 'quizzes' DB table
@Entity('quizzes')
// Database index — speeds up queries that filter by teacherId + status
@Index(['teacherId', 'status'])
export class QuizEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title' })
  title: string;

  // timestamptz = timestamp with timezone (PostgreSQL type)
  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  // We store only IDs — actual class/subject names are fetched from their own tables
  @Column({ name: 'class_id' })
  classId: string;

  @Column({ name: 'section' })
  section: string;

  @Column({ name: 'subject_id' })
  subjectId: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @Column({ name: 'status', default: QuizStatus.DRAFT })
  status: QuizStatus;

  // Multi-tenant support — each school sees its own data
  @Column({ name: 'school_id', default: 'school_001' })
  schoolId: string;

  // Auto-set by TypeORM on insert
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Auto-set by TypeORM on insert & update
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}