import { ApiProperty } from '@nestjs/swagger';

export class TaskTimeTrackResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() taskId: number;
  @ApiProperty() userId: number;
  @ApiProperty() startDate: Date;
  @ApiProperty({ nullable: true, required: false }) endDate: Date | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
