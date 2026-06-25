import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.TEACHER)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all students' })
  async getAllStudents() {
    return this.studentsService.findAll();
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'List students in a section' })
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.getStudentsByClass(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single student by internal id' })
  async getStudent(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @MinRole(Role.COORDINATOR)
  @ApiOperation({ summary: 'Enroll a new student (coordinator+)' })
  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }
}
