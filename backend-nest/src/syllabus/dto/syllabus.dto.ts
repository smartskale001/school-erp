import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSyllabusDto {
  @ApiProperty({ example: 'class_10' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'Class 10A' })
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiProperty({ example: 'subj_01' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  subjectName: string;
}

export class UpdateSyllabusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalChapters?: number;
}

export class CreateSyllabusChapterDto {
  @ApiProperty({ example: 'Algebra Basics' })
  @IsString()
  @IsNotEmpty()
  chapterName: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  chapterNumber: number;
}

export class UpdateSyllabusChapterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chapterNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
