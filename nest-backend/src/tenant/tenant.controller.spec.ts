import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

describe('TenantController', () => {
  let controller: TenantController;
  const mockTenantService = {
    createTenant: jest.fn(),
    defineAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockTenantService }],
    }).compile();

    controller = module.get<TenantController>(TenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTenant', () => {
    it('should create a tenant', async () => {
      mockTenantService.createTenant.mockResolvedValue({
        _id: 'tenant123',
        name: 'Tenant Alpha',
      });

      const body = { name: 'Tenant Alpha' };
      const result = await controller.createTenant(body);
      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        'Tenant Alpha',
      );
      expect(result).toEqual({ _id: 'tenant123', name: 'Tenant Alpha' });
    });
  });

  describe('defineAdmin', () => {
    it('should define a user as admin', async () => {
      mockTenantService.defineAdmin.mockResolvedValue({
        _id: 'user456',
        role: 'admin',
      });

      const result = await controller.defineAdmin('tenant123', 'user456');
      expect(mockTenantService.defineAdmin).toHaveBeenCalledWith(
        'tenant123',
        'user456',
      );
      expect(result).toEqual({ _id: 'user456', role: 'admin' });
    });
  });
});
