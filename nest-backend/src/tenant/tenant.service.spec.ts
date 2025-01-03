import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TenantService } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  const mockTenantModel = {
    create: jest.fn().mockResolvedValue({ _id: 'tenantXYZ', name: 'Tenant ABC' }),
  };
  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: getModelToken('Tenant'), useValue: mockTenantModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTenant', () => {
    it('should create new tenant doc', async () => {
      const result = await service.createTenant('Tenant ABC');
      expect(mockTenantModel.create).toHaveBeenCalledWith({ name: 'Tenant ABC' });
      expect(result.name).toBe('Tenant ABC');
    });
  });

  describe('defineAdmin', () => {
    it('should set user as admin', async () => {
      mockUserModel.findById.mockResolvedValue({
        _id: 'user123',
        role: 'user',
        tenant_id: 'none',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          role: 'admin',
          tenant_id: 'tenantXYZ',
        }),
      });
      const updated = await service.defineAdmin('tenantXYZ', 'user123');
      expect(updated.role).toBe('admin');
      expect(updated.tenant_id).toBe('tenantXYZ');
    });
  });
});
