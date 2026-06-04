import { Controller, Get, Param } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('class/:classId')
  async getStudentsByClass(@Param('classId') classId: string) {
    return this.studentsService.getStudentsByClass(classId);
  }
}
