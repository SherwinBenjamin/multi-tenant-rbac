import { Test, TestingModule } from '@nestjs/testing';
import { UserController, ProfileController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let profileController: ProfileController;
  let mockUserService = {
    createUser: jest.fn(),
    findUsersByTenant: jest.fn(),
    findById: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController, ProfileController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    profileController = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(profileController).toBeDefined();
  });

  describe('createUser', () => {
    it('should call userService.createUser', async () => {
      mockUserService.createUser.mockResolvedValue({ email: 'tester@mail.com' });
      const req = { user: { aud: 'tenant123' } };
      const body = { email: 'tester@mail.com', password: '12345' };
      const result = await userController.createUser(req, body);

      expect(mockUserService.createUser).toHaveBeenCalledWith('tester@mail.com', '12345', 'tenant123');
      expect(result.email).toBe('tester@mail.com');
    });
  });

  describe('listUsers', () => {
    it('should list users in a tenant', async () => {
      mockUserService.findUsersByTenant.mockResolvedValue([{ email: 'u1@mail.com' }]);
      const req = { user: { aud: 'tenant123' } };

      const result = await userController.listUsers(req);
      expect(mockUserService.findUsersByTenant).toHaveBeenCalledWith('tenant123');
      expect(result).toEqual([{ email: 'u1@mail.com' }]);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      mockUserService.findById.mockResolvedValue({ email: 'me@mail.com' });
      const req = { user: { sub: 'user123' } };
      const result = await profileController.getProfile(req);
      expect(mockUserService.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({ email: 'me@mail.com' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      mockUserService.updateProfile.mockResolvedValue({ email: 'new@mail.com' });
      const req = { user: { sub: 'user123', aud: 'tenant123' } };
      const body = { email: 'new@mail.com' };

      const result = await profileController.updateProfile(req, body);
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(req.user, body);
      expect(result).toEqual({ email: 'new@mail.com' });
    });
  });
});
