import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateStudentDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '2014-08-05', description: 'ISO date (YYYY-MM-DD)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'class_10-A', description: 'Section id the student is enrolled into' })
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 14, description: 'Per-section roll number; auto-assigned if omitted' })
  @IsOptional()
  @IsInt()
  @Min(1)
  rollNo?: number;

  @ApiPropertyOptional({ example: '2026-06-25', description: 'Defaults to today if omitted' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Suresh Sharma' })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional({ example: '+91 90000 00000' })
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiPropertyOptional({ example: 'suresh@example.com' })
  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @ApiPropertyOptional({ example: '+91 90000 00001' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: '12 MG Road, Pune' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;
}
