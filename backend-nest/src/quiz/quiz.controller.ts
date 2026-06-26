/**
 * QuizController (Teacher-facing)
 *
 * Handles teacher operations on quizzes:
 *  - Create / list / view / publish quizzes
 *  - Add questions to draft quizzes
 *
 * Every route requires JwtAuthGuard (authenticated teacher).
 */
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

@ApiTags('Quiz (Teacher)')
@ApiBearerAuth()
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  /** Create a new quiz in DRAFT status */
  @ApiOperation({ summary: 'Create a draft quiz' })
  @Post()
  async createQuiz(@Body() dto: CreateQuizDto, @CurrentUser() user: any) {
    return this.quizService.createQuiz(dto, user);
  }

  /** List all quizzes for the logged-in teacher (newest first) */
  @ApiOperation({ summary: 'List my quizzes' })
  @Get()
  async getMyQuizzes(@CurrentUser() user: any) {
    return this.quizService.getMyQuizzes(user);
  }

  /** Get full quiz detail including questions & correct answers (teacher only) */
  @ApiOperation({ summary: 'Get quiz by ID (with questions + correct answers)' })
  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  /** Publish a draft quiz so students can see & join it */
  @ApiOperation({ summary: 'Publish a draft quiz (draft → live)' })
  @Post(':id/publish')
  async publishQuiz(@Param('id') id: string) {
    return this.quizService.publishQuiz(id);
  }

  /** Add a question to a quiz that is still in DRAFT status */
  @ApiOperation({ summary: 'Add a question to a draft quiz' })
  @Post(':quizId/questions')
  async addQuestion(
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizService.addQuestion(quizId, dto);
  }
}
