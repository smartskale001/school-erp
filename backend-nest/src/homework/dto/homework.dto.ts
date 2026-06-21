import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HomeworkStatus, HomeworkSubmissionType } from '../../database/entities/homework.entity';

const parseArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return JSON.parse(value);
  return value;
};

export class CreateHomeworkDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsOptional() topic?: string;
  @IsString() @IsOptional() priority?: string;
  @IsEnum(HomeworkSubmissionType) submissionType: HomeworkSubmissionType;
  @IsString() @IsNotEmpty() classId: string;
  @IsString() @IsNotEmpty() subjectId: string;
  @Transform(parseArray) @IsArray() @ArrayNotEmpty() @IsString({ each: true }) sectionIds: string[];
  @IsDateString() @IsNotEmpty() deadline: string;
}

export class UpdateHomeworkDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() @IsNotEmpty() description?: string;
  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() priority?: string;
}

export class AddHomeworkAssignmentsDto {
  @Transform(parseArray) @IsArray() @ArrayNotEmpty() @IsString({ each: true }) sectionIds: string[];
  @IsDateString() @IsNotEmpty() deadline: string;
}

export class SubmitHomeworkDto {
  @IsOptional() @IsString() submissionText?: string;
}

export class ReviewHomeworkSubmissionDto {
  @IsOptional() @Type(() => Number) @IsNumber() marksObtained?: number;
  @IsOptional() @IsString() teacherFeedback?: string;
}

export class UpdateHomeworkStatusDto {
  @IsEnum(HomeworkStatus) status: HomeworkStatus;
}

export class HomeworkMonitorQueryDto {
  @IsOptional() @IsString() classId?: string;
  @IsOptional() @IsString() section?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsOptional() @IsString() teacherId?: string;
  @IsOptional() @IsEnum(HomeworkStatus) status?: HomeworkStatus;
  @IsOptional() @IsDateString() deadlineFrom?: string;
  @IsOptional() @IsDateString() deadlineTo?: string;
  @IsOptional() @IsString() submissionStatus?: string;
}
