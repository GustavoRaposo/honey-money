import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUsersRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const dbUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  password: 'hashed_password',
  profileId: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  profile: { id: 1, name: 'user' },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123',
    };

    it('deve criar o usuário e retornar UserResponseDto com profile e sem senha', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersRepository.create.mockResolvedValue(dbUser);

      const result = await service.create(dto);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed_password',
      });
      expect(result).toEqual<UserResponseDto>({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        profile: { id: 1, name: 'user' },
        createdAt: dbUser.createdAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar ConflictException quando o email já estiver em uso', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(dbUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário completo com profile para uso interno', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(dbUser);

      const result = await service.findByEmail('joao@email.com');

      expect(result).toEqual(dbUser);
      expect(result?.profile).toEqual({ id: 1, name: 'user' });
    });

    it('deve retornar null quando o email não existir', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('naoexiste@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve retornar UserResponseDto com profile quando o usuário existir', async () => {
      mockUsersRepository.findById.mockResolvedValue(dbUser);

      const result = await service.findById(1);

      expect(result).toEqual<UserResponseDto>({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        profile: { id: 1, name: 'user' },
        createdAt: dbUser.createdAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
