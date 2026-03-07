import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { RecurrenceDuration, RecurrenceType } from '../recurrence.util.js';

export class RecurrenceDto {
  @ApiProperty({ enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'WEEKLY' })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'] as const)
  type: RecurrenceType;

  @ApiProperty({
    description: 'Dias da semana para tipo WEEKLY (0=Dom, 1=Seg, ..., 6=Sáb)',
    example: [2],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiProperty({ example: '09:00', description: 'Horário UTC no formato HH:MM' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time deve estar no formato HH:MM' })
  time: string;

  @ApiProperty({ enum: ['MONTH', 'YEAR'], example: 'MONTH' })
  @IsEnum(['MONTH', 'YEAR'] as const)
  duration: RecurrenceDuration;
}
