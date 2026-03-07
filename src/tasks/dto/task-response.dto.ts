import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Implementar autenticação' })
  name: string;

  @ApiProperty({ example: 'Adicionar JWT ao projeto', nullable: true })
  description: string | null;

  @ApiProperty({ example: 1 })
  priority: number;

  @ApiProperty({ example: 0 })
  statusCode: number;

  @ApiProperty({ example: 'Backlog' })
  statusName: string;

  @ApiProperty({ example: 1 })
  createdById: number;

  @ApiProperty({ example: 2, nullable: true })
  assignedToId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  lastUpdatedById: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
