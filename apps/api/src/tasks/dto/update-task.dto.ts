import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ example: 0, minimum: 0, maximum: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  statusCode?: number;
}
