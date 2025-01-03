import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Tenant')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create a new tenant (superadmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Creates a new tenant document in the DB',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Tenant XYZ' },
      },
    },
  })
  async createTenant(@Body() body: { name: string }) {
    return this.tenantService.createTenant(body.name);
  }

  @Post(':id/access')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Define a user as admin for this tenant' })
  @ApiResponse({
    status: 200,
    description: 'User role updated to admin in the specified tenant',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The tenant ID in the path',
    example: 'tenant123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user456' },
      },
    },
  })
  async defineAdmin(
    @Param('id') tenantId: string,
    @Body('userId') userId: string,
  ) {
    return this.tenantService.defineAdmin(tenantId, userId);
  }
}
