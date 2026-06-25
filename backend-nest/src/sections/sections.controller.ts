import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/sections.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly svc: SectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all class-sections with class teacher, room and student count' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class-section with its roster' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a class-section (admin)' })
  create(@Body() dto: CreateSectionDto) { return this.svc.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard) @MinRole(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Assign class teacher / homeroom / capacity (principal+)' })
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class-section (admin)' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
