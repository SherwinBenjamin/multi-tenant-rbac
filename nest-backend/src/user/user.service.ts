import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { User, UserDocument } from './entities/user.entity';
  import * as bcrypt from 'bcryptjs';
  
  @Injectable()
  export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
    async createUser(email: string, password: string, tenantId: string) {
      const hashed = await bcrypt.hash(password, 10);
      return this.userModel.create({
        email,
        password: hashed,
        tenant_id: tenantId,
        role: 'user',
      });
    }
  
    async findUsersByTenant(tenantId: string) {
      return this.userModel.find({ tenant_id: tenantId });
    }
  
    async findById(userId: string) {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      return user;
    }
  
    async updateProfile(
      requestUser: any,
      body: { email?: string; password?: string },
    ) {
      const user = await this.userModel.findById(requestUser.sub);
      if (!user) throw new NotFoundException('User not found');
  
      if (
        user.tenant_id !== requestUser.aud &&
        requestUser.role !== 'superadmin'
      ) {
        throw new ForbiddenException('Not authorized to update this profile');
      }
  
      if (body.email) user.email = body.email;
      if (body.password) {
        user.password = await bcrypt.hash(body.password, 10);
      }
  
      return user.save();
    }
  }
  