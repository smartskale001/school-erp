import { Body, Controller, Get, Patch, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { CreateTeachingAssignmentDto, UpdateTeachingAssignmentDto } from './dto/teaching-assignment.dto';

@ApiTags('Teaching Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teaching-assignments')
export class TeachingAssignmentsController {
  constructor(private readonly service: TeachingAssignmentsService) {}

  @Get() @Roles(Role.ADMIN)
  findAll(@Query('teacherId') teacherId?: string) { return this.service.findAll(teacherId); }

  @Post() @Roles(Role.ADMIN)
  create(@Body() dto: CreateTeachingAssignmentDto) { return this.service.create(dto); }

  @Patch(':id') @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTeachingAssignmentDto) { return this.service.update(id, dto); }
}
