import {
  Entity, PrimaryGeneratedColumn, Column,
  Index, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED   = 'submitted',
}

@Entity('quiz_attempts')
// Unique constraint — one student can only have ONE attempt per quiz
@Index(['quizId', 'studentId'], { unique: true })
// Index for queries like "find all IN_PROGRESS attempts for quiz X"
@Index(['quizId', 'status'])
export class QuizAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'student_id' })
  studentId: string;

  // nullable because startQuiz() sets this — not set at join time
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  // Filled by calculateScore() after submission
  @Column({ name: 'score', type: 'numeric', precision: 6, scale: 2, nullable: true })
  score: number | null;

  @Column({ name: 'status', length: 20, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus;

  @Column({ name: 'school_id', default: 'school_001' })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}