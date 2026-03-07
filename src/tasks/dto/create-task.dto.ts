import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

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
}
