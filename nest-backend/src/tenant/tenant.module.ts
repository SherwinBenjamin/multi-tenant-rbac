import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant, TenantSchema } from './entities/tenant.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
