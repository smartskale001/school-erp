import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHomeworkDto {
  @ApiProperty({ example: 'Algebra Worksheet' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Complete exercises 1 to 10.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'subj_01' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ example: 'class_10' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'Class 10A' })
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiProperty({ example: '2026-05-29' })
  @IsDateString()
  @IsNotEmpty()
  assignedDate: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

export class UpdateHomeworkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateStudentHomeworkStatusDto {
  @ApiProperty({ example: 'completed' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
