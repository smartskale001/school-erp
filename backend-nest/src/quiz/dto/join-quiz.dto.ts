import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinQuizDto {
  @ApiProperty({ example: 'Riya Sharma', description: 'Student name' })
  @IsString() 
  @IsNotEmpty() 
  studentName: string;

  @ApiPropertyOptional({ example: '2024001', description: 'Optional roll number' })
  @IsOptional() 
  @IsString() 
  rollNumber?: string;
}