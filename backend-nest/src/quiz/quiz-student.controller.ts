import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QuizAttemptService } from './quiz-attempt.service';
import { JoinQuizDto } from './dto/join-quiz.dto';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Quiz (Student)')
@ApiBearerAuth()
@Controller('student/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class QuizStudentController {
  constructor(private readonly attemptService: QuizAttemptService) {}

  /** ✅ UPDATED: List all LIVE quizzes WITH attempt status for the current student */
  @ApiOperation({ summary: 'List all live quizzes (with attempt status)' })
  @Get()
  async getStudentQuizzes(@CurrentUser() user: any) {
    return this.attemptService.getStudentQuizzesWithStatus(user);
  }

  /** Get quiz details (correct answers are stripped from the response) */
  @ApiOperation({ summary: 'Get quiz details (correct answers hidden)' })
  @Get(':id')
  async getQuizDetail(@Param('id') id: string) {
    return this.attemptService.getQuizDetail(id);
  }

  /** Register student for a quiz — creates an IN_PROGRESS attempt */
  @ApiOperation({ summary: 'Join/register for a quiz' })
  @Post(':id/join')
  async joinQuiz(
    @Param('id') id: string,
    @Body() dto: JoinQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.attemptService.joinQuiz(id, dto, user);
  }

  /** Start quiz — seeds blank answer rows and records startedAt timestamp */
  @ApiOperation({ summary: 'Start a quiz (seeds blank answer rows)' })
  @Post(':id/start')
  async startQuiz(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attemptService.startQuiz(id, user);
  }

  /** Save or update the student's answer for one question */
  @ApiOperation({ summary: 'Save/update answer for a single question' })
  @Post(':id/answers/:questionId')
  async saveAnswer(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: SaveAnswerDto,
    @CurrentUser() user: any,
  ) {
    return this.attemptService.saveAnswer(id, questionId, dto, user);
  }

  /** Submit quiz — marks SUBMITTED, calculates score, returns result */
  @ApiOperation({ summary: 'Submit quiz and get score' })
  @Post(':id/submit')
  async submitQuiz(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attemptService.submitQuiz(id, user);
  }

  /** Get score + total marks for a submitted quiz */
  @ApiOperation({ summary: 'Get quiz result (score + total)' })
  @Get(':id/result')
  async getResult(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attemptService.getResult(id, user);
  }
}