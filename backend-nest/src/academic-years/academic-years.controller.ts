import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinRole } from '../auth/decorators/min-role.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicYearsController {
  constructor(private readonly service: AcademicYearsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  getActive() {
    return this.service.getActiveAcademicYear();
  }

  @Post()
  @MinRole(Role.PRINCIPAL)
  create(@Body() dto: CreateAcademicYearDto) {
    return this.service.create(dto);
  }

  @Patch(':id/activate')
  @MinRole(Role.PRINCIPAL)
  activate(@Param('id') id: string) {
    return this.service.activate(+id);
  }

  @Patch(':id')
  @MinRole(Role.PRINCIPAL)
  update(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.service.update(+id, dto);
  }
}
