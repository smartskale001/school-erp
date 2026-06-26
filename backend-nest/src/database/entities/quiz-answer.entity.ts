import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { QuizAttemptEntity } from './quiz-attempt.entity';
import { QuizQuestionEntity } from './quiz-question.entity';

@Entity('quiz_answers')
// One answer row per (attempt + question) — no duplicates
@Index(['attemptId', 'questionId'], { unique: true })
@Index(['attemptId'])
export class QuizAnswerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  // @ManyToOne creates a FK relationship to the parent entity
  // onDelete: 'CASCADE' = if the attempt is deleted, its answer rows are deleted too
  @ManyToOne(() => QuizAttemptEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttemptEntity;

  @Column({ name: 'attempt_id', type: 'uuid' }) attemptId: string;

  @ManyToOne(() => QuizQuestionEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestionEntity;

  @Column({ name: 'question_id', type: 'uuid' }) questionId: string;

  // Stores the student's answer as JSON — null if unanswered
  @Column({ name: 'given_answer', type: 'jsonb', nullable: true })
  givenAnswer: string | string[] | null;

  // Set by calculateScore() after submission
  @Column({ name: 'marks_obtained', type: 'numeric', precision: 5, scale: 2, nullable: true })
  marksObtained: number | null;

  // Only UpdateDateColumn (no CreateDateColumn) — answers are updated in-place as student changes them
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}