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

  @ApiProperty({ example: false })
  isRunning: boolean;

  @ApiProperty({ example: false })
  isRecurrent: boolean;

  @ApiProperty({ example: null, nullable: true })
  parentTaskId: number | null;

  @ApiProperty({ example: 'WEEKLY', nullable: true })
  recurrenceType: string | null;

  @ApiProperty({ example: '2', nullable: true })
  recurrenceDays: string | null;

  @ApiProperty({ example: '09:00', nullable: true })
  recurrenceTime: string | null;

  @ApiProperty({ example: 'MONTH', nullable: true })
  recurrenceDuration: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
