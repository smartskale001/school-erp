import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QuizAttemptEntity, AttemptStatus } from '../database/entities/quiz-attempt.entity';
import { QuizAnswerEntity } from '../database/entities/quiz-answer.entity';
import { QuizQuestionEntity } from '../database/entities/quiz-question.entity';
import { QuizEntity } from '../database/entities/quiz.entity';
import { StudentEntity } from '../database/entities/student.entity';

@Injectable()
export class QuizResultService {
  constructor(
    @InjectRepository(QuizAttemptEntity)
    private attemptRepository: Repository<QuizAttemptEntity>,
    @InjectRepository(QuizAnswerEntity)
    private answerRepository: Repository<QuizAnswerEntity>,
    @InjectRepository(QuizQuestionEntity)
    private questionRepository: Repository<QuizQuestionEntity>,
    @InjectRepository(QuizEntity)
    private quizRepository: Repository<QuizEntity>,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
  ) {}

  async calculateScore(attemptId: string) {
    const attempt = await this.attemptRepository.findOne({ where: { id: attemptId } });
    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found for scoring.');
    }

    const questions = await this.questionRepository.find({ where: { quizId: attempt.quizId } });
    const questionMap = new Map(questions.map(q => [q.id, q]));

    const answers = await this.answerRepository.find({ where: { attemptId } });
    let totalScore = 0;
    let totalMarks = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (question) {
        totalMarks += parseFloat(question.marks as any);
        if (this.answersMatch(answer.givenAnswer, question.correctAnswer)) {
          totalScore += parseFloat(question.marks as any);
          answer.marksObtained = parseFloat(question.marks as any);
        } else {
          answer.marksObtained = 0;
        }
        await this.answerRepository.save(answer);
      }
    }

    attempt.score = totalScore;
    await this.attemptRepository.save(attempt);

    return {
      score: totalScore,
      total: totalMarks,
    };
  }

  async getQuizResults(quizId: string, teacherUser: any) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, teacherId: teacherUser.teacherId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found or does not belong to the teacher.');
    }

    const attempts = await this.attemptRepository.find({
      where: { quizId, status: AttemptStatus.SUBMITTED },
      order: { submittedAt: 'ASC' },
    });

    if (attempts.length === 0) {
      return [];
    }

    const studentIds = [...new Set(attempts.map(attempt => attempt.studentId))];
    const students = await this.studentRepository.find({
      where: { studentId: In(studentIds) },
    });
    const studentMap = new Map(students.map(student => [student.id, student]));

    const questions = await this.questionRepository.find({ where: { quizId } });
    const totalPossible = questions.reduce((sum, q) => sum + parseFloat(q.marks as any), 0);

    return attempts.map(attempt => {
      const student = studentMap.get(attempt.studentId);
      return {
        attemptId: attempt.id,
        studentId: attempt.studentId,
        studentName: student ? student.fullName : 'Unknown Student',
        rollNumber: student ? String(student.rollNo) : 'N/A',
        score: attempt.score,
        total: totalPossible,
        submittedAt: attempt.submittedAt,
        status: attempt.status,
      };
    });
  }

  private answersMatch(given: string | string[] | null, correct: string | string[]): boolean {
     if (!given) return false;
    if (Array.isArray(given) && Array.isArray(correct)) {
      return given.length === correct.length && given.every(a => (correct as string[]).includes(a));
    }
    return given === correct;
  }
}
