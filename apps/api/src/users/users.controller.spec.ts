import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

const mockUsersService = {
  create: jest.fn(),
  findById: jest.fn(),
};

const userResponse: UserResponseDto = {
  id: 1,
  name: 'João Silva',
  email: 'joao@email.com',
  createdAt: new Date('2024-01-01'),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('deve criar um usuário e retornar UserResponseDto', async () => {
      const dto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'senha123',
      };

      mockUsersService.create.mockResolvedValue(userResponse);

      const result = await controller.create(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(userResponse);
    });
  });

  describe('GET /users/me', () => {
    it('deve retornar os dados do usuário autenticado', async () => {
      const req = { user: { id: 1 } };

      mockUsersService.findById.mockResolvedValue(userResponse);

      const result = await controller.getMe(req as any);

      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(userResponse);
    });
  });
});
