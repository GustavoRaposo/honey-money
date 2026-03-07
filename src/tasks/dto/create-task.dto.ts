import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implementar autenticação' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Adicionar JWT ao projeto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  assignedToId?: number;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-01-30T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
