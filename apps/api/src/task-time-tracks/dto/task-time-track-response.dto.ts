import { ApiProperty } from '@nestjs/swagger';

export class TaskTimeTrackResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 42 }) taskId: number;
  @ApiProperty({ example: 7 }) userId: number;
  @ApiProperty({ example: '2024-01-15T08:00:00.000Z' }) startDate: Date;
  @ApiProperty({
    nullable: true,
    required: false,
    example: '2024-01-15T09:30:00.000Z',
  })
  endDate: Date | null;
  @ApiProperty({ example: '2024-01-15T08:00:00.000Z' }) createdAt: Date;
  @ApiProperty({ example: '2024-01-15T09:30:00.000Z' }) updatedAt: Date;
}
