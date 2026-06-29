/**
 * QuizAttemptService
 *
 * Student-facing business logic for quiz attempts.
 * Handles joining, starting, answering, submitting, and scoring quizzes.
 * Also provides the student view of quizzes (correct answers stripped).
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizEntity, QuizStatus } from '../database/entities/quiz.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { QuizAttemptEntity, AttemptStatus } from '../database/entities/quiz-attempt.entity';
import { QuizAnswerEntity } from '../database/entities/quiz-answer.entity';
import { QuizQuestionEntity } from '../database/entities/quiz-question.entity';
import { QuizResultService } from './quiz-result.service';
import { JoinQuizDto } from './dto/join-quiz.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';

@Injectable()
export class QuizAttemptService {
  constructor(
    @InjectRepository(QuizEntity)
    private quizRepository: Repository<QuizEntity>,
    @InjectRepository(QuizAttemptEntity)
    private attemptRepository: Repository<QuizAttemptEntity>,
    @InjectRepository(QuizAnswerEntity)
    private answerRepository: Repository<QuizAnswerEntity>,
    @InjectRepository(QuizQuestionEntity)
    private questionRepository: Repository<QuizQuestionEntity>,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    private resultService: QuizResultService,
  ) {}

  /** List all LIVE quizzes that students can attempt */
  async getStudentQuizzes() {
    return this.quizRepository.find({
      where: { status: QuizStatus.LIVE },
      order: { scheduledAt: 'ASC' },
    });
  }

  /** Show quiz detail to student — correctAnswer is stripped from every question */
  async getQuizDetail(id: string) {
    const quiz = await this.quizRepository.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = await this.questionRepository.find({
      where: { quizId: id },
      order: { orderIndex: 'ASC' },
    });

    const safeQuestions = questions.map(({ correctAnswer, ...rest }) => rest);
    return { ...quiz, questions: safeQuestions };
  }

/** List all LIVE quizzes enriched with the student's attempt status */
async getStudentQuizzesWithStatus(user: any) {
  const quizzes = await this.quizRepository.find({
    where: { status: QuizStatus.LIVE },
    order: { scheduledAt: 'ASC' },
  });

  // Get all attempts for this student
  const attempts = await this.attemptRepository.find({
    where: { studentId: user.studentId || user.id },
  });

  // Map for quick lookup
  const attemptMap = new Map(
    attempts.map((attempt) => [attempt.quizId, attempt]),
  );

  // Enrich quizzes with attempt status
  return quizzes.map((quiz) => {
    const attempt = attemptMap.get(quiz.id);
    return {
      ...quiz,
      attemptStatus: attempt ? attempt.status : null, // null | 'in_progress' | 'submitted'
      attemptId: attempt?.id || null,
      submittedAt: attempt?.submittedAt || null,
    };
  });
}

  /** Register student interest — creates an IN_PROGRESS attempt (one per student per quiz) */
  async joinQuiz(quizId: string, dto: JoinQuizDto, user: any) {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    if (!dto.rollNumber) throw new BadRequestException('Roll number is required');

    const student = await this.studentRepository.findOne({
      where: { rollNo: Number(dto.rollNumber) },
    });
    if (!student) throw new BadRequestException('Student not found with this roll number');

    const existing = await this.attemptRepository.findOne({
      where: { quizId, studentId: student.id },
    });
    if (existing) throw new BadRequestException('Already joined this quiz');

    const attempt = this.attemptRepository.create({
      quizId,
      studentId: student.id,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
      schoolId: user.schoolId || 'school_001',
    });

    await this.attemptRepository.save(attempt);
    return { attemptId: attempt.id, startedAt: attempt.startedAt };
  }

  /**
   * Start a quiz attempt — seeds one blank QuizAnswerEntity per question
   * (auto-joins if student hasn't explicitly joined).
   */
  async startQuiz(quizId: string, user: any) {

    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let attempt = await this.attemptRepository.findOne({
      where: { quizId, studentId: user.studentId || user.id },
    });

    if (!attempt) {
      attempt = this.attemptRepository.create({
        quizId,
        studentId: user.studentId || user.id,
        status: AttemptStatus.IN_PROGRESS,
        schoolId: user.schoolId || 'school_001',
      });
      attempt = await this.attemptRepository.save(attempt);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is already submitted');
    }

    const existingAnswers = await this.answerRepository.count({
      where: { attemptId: attempt.id },
    });

    if (existingAnswers === 0) {
      const questions = await this.questionRepository.find({
        where: { quizId },
        order: { orderIndex: 'ASC' },
      });

      const answerRows = questions.map((q) =>
        this.answerRepository.create({
          attemptId: attempt.id,
          questionId: q.id,
        }),
      );

      await this.answerRepository.save(answerRows);
    }

if (!attempt.startedAt) {
  attempt.startedAt = new Date();
}    await this.attemptRepository.save(attempt);

    return { attemptId: attempt.id, startedAt: attempt.startedAt };
  }

  /** Upsert student's answer for a single question (called each time they change it) */
  async saveAnswer(quizId: string, questionId: string, dto: SaveAnswerDto, user: any) {
    const attempt = await this.attemptRepository.findOne({
      where: { quizId, studentId: user.studentId || user.id, status: AttemptStatus.IN_PROGRESS },
    });
    if (!attempt) throw new NotFoundException('Active attempt not found');

    let answer = await this.answerRepository.findOne({
      where: { attemptId: attempt.id, questionId },
    });

    if (answer) {
      answer.givenAnswer = dto.givenAnswer;
    } else {
      answer = this.answerRepository.create({
        attemptId: attempt.id,
        questionId,
        givenAnswer: dto.givenAnswer,
      });
    }

    return this.answerRepository.save(answer);
  }

  /** Submit the quiz — marks SUBMITTED and delegates scoring to QuizResultService */
  async submitQuiz(quizId: string, user: any) {
    const attempt = await this.attemptRepository.findOne({
      where: { quizId, studentId: user.studentId || user.id, status: AttemptStatus.IN_PROGRESS },
    });
    if (!attempt) throw new NotFoundException('Active attempt not found');

    attempt.status = AttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();
    await this.attemptRepository.save(attempt);

    const result = await this.resultService.calculateScore(attempt.id);

    return {
      attemptId: attempt.id,
      submittedAt: attempt.submittedAt,
      ...result,
    };
  }

  /** Get result for a submitted quiz (score + total marks) */
  async getResult(quizId: string, user: any) {
    const attempt = await this.attemptRepository.findOne({
      where: { quizId, studentId: user.studentId || user.id },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.SUBMITTED) {
      throw new BadRequestException('Quiz not submitted yet');
    }

    const questions = await this.questionRepository.find({ where: { quizId } });
    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);

    return {
      attemptId: attempt.id,
      score: attempt.score,
      total: totalMarks,
      submittedAt: attempt.submittedAt,
    };
  }
}
