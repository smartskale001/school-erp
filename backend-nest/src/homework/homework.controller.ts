import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, UpdateHomeworkDto, UpdateStudentHomeworkStatusDto } from './dto/homework.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Homework')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Create homework' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`;
        cb(null, uniqueName);
      },
    }),
  }))
  create(
    @Body() dto: CreateHomeworkDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
      dto.attachmentUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    return this.homeworkService.createHomework(dto, user.teacherId || user.id, user.name || 'Teacher');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Update homework' })
  update(@Param('id') id: string, @Body() dto: UpdateHomeworkDto, @CurrentUser() user: any) {
    const isAdmin = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    return this.homeworkService.updateHomework(id, dto, user.teacherId || user.id, isAdmin);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Delete homework' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    return this.homeworkService.deleteHomework(id, user.teacherId || user.id, isAdmin);
  }

  @Get('teacher/me')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Get teacher homework' })
  getTeacherHomework(@CurrentUser() user: any) {
    return this.homeworkService.getTeacherHomework(user.teacherId || user.id);
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.COORDINATOR)
  @ApiOperation({ summary: 'Get class homework' })
  getClassHomework(@Param('classId') classId: string) {
    return this.homeworkService.getClassHomework(classId);
  }

  // --- Student Routes ---

  @Get('student/me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student homework' })
  getStudentHomework(@CurrentUser() user: any) {
    return this.homeworkService.getStudentHomework(user.id);
  }

  @Get('student/stats')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student homework stats' })
  getStudentStats(@CurrentUser() user: any) {
    return this.homeworkService.getStudentStats(user.id);
  }

  @Patch('student/:homeworkId/status')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update student homework status' })
  updateStatus(
    @Param('homeworkId') homeworkId: string,
    @Body() dto: UpdateStudentHomeworkStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.homeworkService.updateStudentHomeworkStatus(homeworkId, user.id, dto);
  }

  @Post('mark-overdue')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark overdue homework' })
  markOverdue() {
    return this.homeworkService.markOverdueHomework();
  }
}
