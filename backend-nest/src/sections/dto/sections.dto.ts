import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: 'Parent class id' })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Section name, e.g. "A"' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, default: 40 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classTeacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class UpdateSectionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  // `null` clears the assignment; a string assigns it.
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  classTeacherId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  roomId?: string | null;
}
