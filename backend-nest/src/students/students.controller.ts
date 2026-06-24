import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.TEACHER)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async getAllStudents() {
    return this.studentsService.findAll();
  }

  @Get('class/:classId')
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.getStudentsByClass(classId);
  }
}
