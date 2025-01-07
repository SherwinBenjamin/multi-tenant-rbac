import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './entities/tenant.entity';
import { User, UserDocument } from '../user/entities/user.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createTenant(name: string) {
    return this.tenantModel.create({ name });
  }

  async findAllTenants() {
    return this.tenantModel.find();
  }

  async defineAdmin(tenantId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = 'admin';
    user.tenant_id = tenantId;
    return user.save();
  }
}
