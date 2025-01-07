import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens from AuthService', async () => {
      mockAuthService.validateUser.mockResolvedValue({ _id: 'someUserId' });
      mockAuthService.login.mockResolvedValue({
        accessToken: 'abc',
        refreshToken: 'xyz',
      });

      const body = { email: 'test@mail.com', password: 'secret' };
      const result = await controller.login(body);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@mail.com',
        'secret',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({ _id: 'someUserId' });
      expect(result).toEqual({ accessToken: 'abc', refreshToken: 'xyz' });
    });
  });

  describe('refresh', () => {
    it('should return a new token pair', async () => {
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'newA',
        refreshToken: 'newR',
      });
      const body = { token: 'oldRefresh' };

      const result = await controller.refresh(body);
      expect(mockAuthService.refresh).toHaveBeenCalledWith('oldRefresh');
      expect(result).toEqual({ accessToken: 'newA', refreshToken: 'newR' });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockAuthService.register.mockResolvedValue({
        email: 'newuser@example.com',
      });
      const body = {
        email: 'newuser@example.com',
        password: 'MySecret123',
        tenantId: 'tenant_abc',
        role: 'user',
      };

      const result = await controller.register(body);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'newuser@example.com',
        'MySecret123',
        'tenant_abc',
        'user',
      );
      expect(result.email).toBe('newuser@example.com');
    });
  });
});
