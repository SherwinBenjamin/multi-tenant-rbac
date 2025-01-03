import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash password and save user', async () => {
      const hashedPass = await bcrypt.hash('plainPass', 10);
      mockUserModel.create.mockResolvedValue({ email: 'test@mail.com', password: hashedPass });

      const result = await service.createUser('test@mail.com', 'plainPass', 'tenant123');
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(result.password).toBe(hashedPass);
    });
  });

  describe('findUsersByTenant', () => {
    it('should return all users in a tenant', async () => {
      mockUserModel.find.mockResolvedValue([{ email: 'one@mail.com' }, { email: 'two@mail.com' }]);
      const result = await service.findUsersByTenant('tenant123');
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockResolvedValue({ email: 'me@mail.com' });
      const result = await service.findById('user123');
      expect(result.email).toBe('me@mail.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user email or password', async () => {
      mockUserModel.findById.mockResolvedValue({
        _id: 'user123',
        email: 'old@mail.com',
        password: 'oldPass',
        tenant_id: 'tenant123',
        save: jest.fn().mockResolvedValue({ email: 'new@mail.com' }),
      });

      const requestUser = { sub: 'user123', aud: 'tenant123', role: 'user' };
      const body = { email: 'new@mail.com' };
      const result = await service.updateProfile(requestUser, body);
      expect(result.email).toBe('new@mail.com');
    });
  });
});
