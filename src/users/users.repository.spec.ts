import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário e retornar os dados persistidos', async () => {
      const dto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hashed_password',
      };

      const dbUser = {
        id: 1,
        name: dto.name,
        email: dto.email,
        password: dto.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(dbUser);

      const result = await repository.create(dto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(dbUser);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário quando o email existir', async () => {
      const dbUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);

      const result = await repository.findByEmail('joao@email.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@email.com' },
      });
      expect(result).toEqual(dbUser);
    });

    it('deve retornar null quando o email não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('naoexiste@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve retornar o usuário quando o id existir', async () => {
      const dbUser = {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);

      const result = await repository.findById(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(dbUser);
    });

    it('deve retornar null quando o id não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});
