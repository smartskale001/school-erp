import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SyllabusService } from './syllabus.service';
import { CreateSyllabusDto, UpdateSyllabusDto, CreateSyllabusChapterDto, UpdateSyllabusChapterDto } from './dto/syllabus.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Syllabus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Create syllabus' })
  create(@Body() dto: CreateSyllabusDto, @CurrentUser() user: any) {
    return this.syllabusService.createSyllabus(dto, user.teacherId || user.id, user.name || 'Teacher');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Update syllabus total chapters' })
  update(@Param('id') id: string, @Body() dto: UpdateSyllabusDto, @CurrentUser() user: any) {
    const isAdmin = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    return this.syllabusService.updateSyllabus(id, dto, user.teacherId || user.id, isAdmin);
  }

  @Get('teacher/me')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Get teacher syllabus' })
  getTeacherSyllabus(@CurrentUser() user: any) {
    return this.syllabusService.getTeacherSyllabus(user.teacherId || user.id);
  }

  @Get('student/me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student syllabus by class' })
  getStudentSyllabus(@CurrentUser() user: any) {
    return this.syllabusService.getStudentSyllabus(user.className);
  }

  @Post(':id/chapter')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Add chapter to syllabus' })
  addChapter(@Param('id') id: string, @Body() dto: CreateSyllabusChapterDto, @CurrentUser() user: any) {
    const isAdmin = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    return this.syllabusService.addChapter(id, dto, user.teacherId || user.id, isAdmin);
  }

  @Patch('chapter/:id')
  @Roles(Role.ADMIN, Role.PRINCIPAL, Role.TEACHER)
  @ApiOperation({ summary: 'Update chapter status' })
  updateChapter(@Param('id') id: string, @Body() dto: UpdateSyllabusChapterDto, @CurrentUser() user: any) {
    const isAdmin = [Role.ADMIN, Role.PRINCIPAL].includes(user.role);
    return this.syllabusService.updateChapter(id, dto, user.teacherId || user.id, isAdmin);
  }
}
