// DTO = Data Transfer Object — validates the shape of incoming request bodies
// These decorators (@IsString, @IsNotEmpty) are auto-run by NestJS's ValidationPipe
import { IsString, IsNotEmpty, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ example: 'Science Chapter 3 Quiz', description: 'Quiz title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'CLS-007', description: 'Class ID (from /api/classes)' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'A', description: 'Section name' })
  @IsString()
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: 'SUB-SCI', description: 'Subject ID (from /api/subjects)' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: '2026-07-15', description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '10:30', description: 'Start time in HH:mm format' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: 20, description: 'Duration in minutes (5–180)' })
  @IsInt()
  @Min(5)
  @Max(180)
  durationMinutes: number;
}