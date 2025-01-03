import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
  };
  const mockRefreshTokenModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('RefreshToken'), useValue: mockRefreshTokenModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh token', async () => {
      mockJwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');
      mockRefreshTokenModel.create.mockResolvedValue(true);

      const user = { _id: '123', tenant_id: 'tenantXYZ', role: 'user' } as any;
      const result = await service.login(user);
      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
      expect(mockRefreshTokenModel.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should rotate tokens', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '123', aud: 'tenantXYZ', role: 'user' });
      mockRefreshTokenModel.findOne.mockResolvedValue({ token: 'oldToken' });
      mockRefreshTokenModel.deleteOne.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('newAccess').mockReturnValueOnce('newRefresh');
      mockRefreshTokenModel.create.mockResolvedValue(true);

      const result = await service.refresh('oldToken');
      expect(result).toEqual({ accessToken: 'newAccess', refreshToken: 'newRefresh' });
      expect(mockRefreshTokenModel.deleteOne).toHaveBeenCalledWith({ token: 'oldToken' });
    });
  });
});
