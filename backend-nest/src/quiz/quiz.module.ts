/**
 * QuizModule
 *
 * Wires together all quiz-related components:
 * - Entities: QuizEntity, QuizQuestionEntity, QuizAttemptEntity, QuizAnswerEntity
 * - Controllers: QuizController (teacher), QuizStudentController (student)
 * - Services: QuizService, QuizAttemptService, QuizResultService
 *
 * Imported by AppModule to expose /quizzes and /student/quizzes endpoints.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizEntity } from '../database/entities/quiz.entity';
import { QuizQuestionEntity } from '../database/entities/quiz-question.entity';
import { QuizAttemptEntity } from '../database/entities/quiz-attempt.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { QuizAnswerEntity } from '../database/entities/quiz-answer.entity';
import { QuizController } from './quiz.controller';
import { QuizStudentController } from './quiz-student.controller';
import { QuizService } from './quiz.service';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizResultService } from './quiz-result.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizEntity, 
      QuizQuestionEntity, 
      QuizAttemptEntity, 
      QuizAnswerEntity,
      StudentEntity
    ]),
  ],
  controllers: [QuizController, QuizStudentController],
  providers: [
    QuizService, 
    QuizAttemptService, 
    QuizResultService
  ],
})
export class QuizModule {}