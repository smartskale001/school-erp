import { ApiProperty } from '@nestjs/swagger';

export class SaveAnswerDto {
  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'B' },
      { type: 'array', items: { type: 'string' }, example: ['A', 'C'] },
      { type: 'null' },
    ],
    description: 'Student\'s answer. null to clear.',
  })
  givenAnswer: string | string[] | null;
}