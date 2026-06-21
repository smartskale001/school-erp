import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { HomeworkService } from './homework.service';
import { AddHomeworkAssignmentsDto, CreateHomeworkDto, HomeworkMonitorQueryDto, ReviewHomeworkSubmissionDto, SubmitHomeworkDto, UpdateHomeworkDto, UpdateHomeworkStatusDto } from './dto/homework.dto';
import { homeworkUploadOptions } from './homework.upload';

@ApiTags('Homework')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly service: HomeworkService) {}

  @Get('teacher/context')
  @Roles(Role.TEACHER)
  context(@CurrentUser() user: any) { return this.service.getTeacherContext(user.teacherId); }

  @Get('teacher/me')
  @Roles(Role.TEACHER)
  teacherHomework(@CurrentUser() user: any) { return this.service.getTeacherHomework(user.teacherId); }

  @Post()
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('attachment', homeworkUploadOptions))
  create(@Body() dto: CreateHomeworkDto, @CurrentUser() user: any, @UploadedFile() file?: any) {
    return this.service.createHomework(dto, user.teacherId, file);
  }

  @Post(':id/assignments')
  @Roles(Role.TEACHER)
  addAssignments(@Param('id') id: string, @Body() dto: AddHomeworkAssignmentsDto, @CurrentUser() user: any) {
    return this.service.addAssignments(id, dto, user.teacherId);
  }

  @Get('assignments/:id/submissions')
  @Roles(Role.TEACHER)
  submissions(@Param('id') id: string, @CurrentUser() user: any) { return this.service.getAssignmentSubmissions(id, user.teacherId); }

  @Patch('submissions/:id/review')
  @Roles(Role.TEACHER)
  review(@Param('id') id: string, @Body() dto: ReviewHomeworkSubmissionDto, @CurrentUser() user: any) {
    return this.service.reviewSubmission(id, dto, user.teacherId);
  }

  @Get('student/me')
  @Roles(Role.STUDENT)
  studentHomework(@CurrentUser() user: any) { return this.service.getStudentHomework(user.id); }

  @Get('student/assignments/:id')
  @Roles(Role.STUDENT)
  studentAssignment(@Param('id') id: string, @CurrentUser() user: any) { return this.service.getStudentAssignment(id, user.id); }

  @Post('student/assignments/:id/submission')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file', homeworkUploadOptions))
  submit(@Param('id') id: string, @Body() dto: SubmitHomeworkDto, @CurrentUser() user: any, @UploadedFile() file?: any) {
    return this.service.submitHomework(id, dto, user.id, file);
  }

  @Get('monitor')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR)
  monitor(@Query() query: HomeworkMonitorQueryDto) { return this.service.monitor(query); }

  @Get('monitor/:id')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR)
  monitorDetail(@Param('id') id: string) { return this.service.getHomeworkWithAssignments(id); }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateHomeworkStatusDto) { return this.service.updateStatus(id, dto.status); }

  @Get(':id')
  @Roles(Role.TEACHER)
  detail(@Param('id') id: string, @CurrentUser() user: any) { return this.service.getHomeworkWithAssignments(id, user.teacherId); }

  @Patch(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto, @CurrentUser() user: any) { return this.service.updateHomework(id, dto, user.teacherId); }
}
