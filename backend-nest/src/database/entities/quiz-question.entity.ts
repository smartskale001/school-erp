import {
  Entity, PrimaryGeneratedColumn, Column,
  Index, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum QuestionType {
  MCQ_SINGLE = 'mcq_single',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
}

@Entity('quiz_questions')
// Composite index: speeds up "find questions for quiz X, ordered by orderIndex"
@Index(['quizId', 'orderIndex'])
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK back to the parent quiz
  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  // Controls display order (1, 2, 3…)
  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @Column({ name: 'question_type', length: 30 })
  questionType: QuestionType;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  // jsonb = stores the full options array as JSON inside the column
  // e.g. [{ id: "A", text: "Water" }, { id: "B", text: "Fire" }]
  @Column({ name: 'options', type: 'jsonb', nullable: true })
  options: { id: string; text: string }[] | null;

  // correctAnswer uses jsonb too — a single string for MCQ/TF, string[] for fill_blank
  @Column({ name: 'correct_answer', type: 'jsonb' })
  correctAnswer: string | string[];

  @Column({ name: 'marks', type: 'numeric', precision: 5, scale: 2, default: 1 })
  marks: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}