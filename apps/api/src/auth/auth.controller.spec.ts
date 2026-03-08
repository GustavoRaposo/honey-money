import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('deve retornar accessToken quando as credenciais forem válidas', async () => {
      const dto: LoginDto = {
        email: 'joao@email.com',
        password: 'senha123',
      };

      const response: AuthResponseDto = { accessToken: 'jwt_token' };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('POST /auth/refresh', () => {
    it('deve retornar novo accessToken para usuário autenticado', () => {
      const req = {
        user: {
          id: 1,
          email: 'joao@email.com',
          profileId: 1,
          profileName: 'user',
        },
      };
      const response: AuthResponseDto = { accessToken: 'new_jwt_token' };
      mockAuthService.refresh.mockReturnValue(response);

      const result = controller.refresh(req as any);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(response);
    });
  });
});
