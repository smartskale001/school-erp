import { IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested,  Allow } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '../../database/entities/quiz-question.entity';

class OptionDto {
  @ApiProperty({ example: 'A', description: 'Option identifier' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Water', description: 'Option text' })
  @IsString()
  text: string;
}

export class CreateQuestionDto {
  @ApiProperty({ enum: QuestionType, example: 'mcq_single' })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ example: 'What is H₂O?', description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiPropertyOptional({
    type: [OptionDto],
    description: 'Options for MCQ / True-False (omit for fill_blank)',
    example: [{ id: 'A', text: 'Water' }, { id: 'B', text: 'Fire' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'A' },
      { type: 'array', items: { type: 'string' }, example: ['east'] },
    ],
    description: 'Correct answer: string for MCQ/TF, string[] for fill_blank',
  })

  @Allow()
  correctAnswer: string | string[];

  @ApiProperty({ example: 1, description: 'Marks for this question (min 0.5)' })
  @IsNumber()
  @Min(0.5)
  marks: number;
}