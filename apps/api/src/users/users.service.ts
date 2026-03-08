import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';
import { UsersRepository, type UserWithProfile } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mail já está em uso.');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return this.toResponseDto(user);
  }

  private toResponseDto(user: UserWithProfile): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: { id: user.profile.id, name: user.profile.name },
      createdAt: user.createdAt,
    };
  }
}
