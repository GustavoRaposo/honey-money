import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'] })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ type: ProfileDto })
  profile: ProfileDto;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  createdAt: Date;
}
