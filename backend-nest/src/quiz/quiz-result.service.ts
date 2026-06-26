/**
 * QuizResultService
 *
 * Scoring engine for quiz attempts.
 * Compares student answers against correct answers and assigns marks.
 * Supports three question types: mcq_single, true_false, fill_blank.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttemptEntity } from '../database/entities/quiz-attempt.entity';
import { QuizAnswerEntity } from '../database/entities/quiz-answer.entity';
import { QuizQuestionEntity } from '../database/entities/quiz-question.entity';

@Injectable()
export class QuizResultService {
  constructor(
    @InjectRepository(QuizAnswerEntity)
    private answerRepository: Repository<QuizAnswerEntity>,
    @InjectRepository(QuizQuestionEntity)
    private questionRepository: Repository<QuizQuestionEntity>,
    @InjectRepository(QuizAttemptEntity)
    private attemptRepository: Repository<QuizAttemptEntity>,
  ) {}

  /**
   * Calculate score for a completed quiz attempt.
   *
   * Grading rules:
   *  - mcq_single / true_false → exact string match
   *  - fill_blank → case-insensitive match against any accepted answer
   *  - Unanswered questions (givenAnswer === null) get 0 marks
   *
   * Persists per-question marksObtained + total score on the attempt.
   */
  async calculateScore(attemptId: string) {
    const attempt = await this.attemptRepository.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const answers = await this.answerRepository.find({ where: { attemptId } });
    const questions = await this.questionRepository.find({
      where: { quizId: attempt.quizId },
    });

    let totalScore = 0;

    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question || answer.givenAnswer === null) continue;

      let correct = false;

      if (question.questionType === 'mcq_single' || question.questionType === 'true_false') {
        correct = answer.givenAnswer === question.correctAnswer;
      }

      if (question.questionType === 'fill_blank') {
        const accepted = (question.correctAnswer as string[]).map((a) => a.toLowerCase().trim());
        const given = String(answer.givenAnswer || '').toLowerCase().trim();
        correct = accepted.includes(given);
      }

      const marks = correct ? Number(question.marks) : 0;
      answer.marksObtained = marks;
      totalScore += marks;
    }

    await this.answerRepository.save(answers);
    attempt.score = totalScore;
    await this.attemptRepository.save(attempt);

    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);

    return { score: totalScore, total: totalMarks };
  }
}
