import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
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

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'joao@email.com',
      password: 'senha123',
    };

    it('deve retornar accessToken quando as credenciais forem válidas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(dbUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(dto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(argon2.verify).toHaveBeenCalledWith(dbUser.password, dto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: dbUser.id,
        email: dbUser.email,
        profileId: dbUser.profile.id,
        profileName: dbUser.profile.name,
      });
      expect(result).toEqual({ accessToken: 'jwt_token' });
    });

    it('deve lançar UnauthorizedException quando o email não existir', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando a senha estiver incorreta', async () => {
      mockUsersService.findByEmail.mockResolvedValue(dbUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
