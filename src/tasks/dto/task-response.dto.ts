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

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z', nullable: true })
  startDate: Date | null;

  @ApiProperty({ example: '2024-01-30T00:00:00.000Z', nullable: true })
  endDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
