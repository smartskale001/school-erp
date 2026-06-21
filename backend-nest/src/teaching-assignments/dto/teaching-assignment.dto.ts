import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsString() @IsNotEmpty() teacherId: string;
  @IsString() @IsNotEmpty() classId: string;
  @IsString() @IsNotEmpty() section: string;
  @IsString() @IsNotEmpty() subjectId: string;
  @Type(() => Number) @IsInt() academicYearId: number;
}

export class UpdateTeachingAssignmentDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
