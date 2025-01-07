import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorators';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Create a new user in the tenant (admin or superadmin)' })
  @ApiResponse({
    status: 201,
    description: 'A new user is created under the admin’s tenant',
  })
  async createUser(
    @Req() req,
    @Body() body: { email: string; password: string },
  ) {
    const tenantId = req.user.aud;
    // If superadmin, you might allow specifying a tenant in the body
    // or default to the superadmin’s "aud" (though superadmins typically don't have a single tenant).
    // For simplicity, we'll do the admin approach:
    return this.userService.createUser(body.email, body.password, tenantId);
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'List users in your tenant if admin, or all if superadmin' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of user objects',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Optional search term to filter by email or name',
    example: 'john',
  })
  async listUsers(@Req() req, @Query('search') searchTerm?: string) {
    // if role is superadmin => return all users
    // if role is admin => return only that tenant’s users
    if (req.user.role === 'superadmin') {
      return this.userService.findAllUsers();
    } else {
      const tenantId = req.user.aud;
      return this.userService.findUsersByTenant(tenantId);
    }
  }
}

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles('user', 'admin', 'superadmin')
  @ApiOperation({ summary: 'Get your own profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user’s profile document',
  })
  async getProfile(@Req() req) {
    return this.userService.findById(req.user.sub);
  }

  @Put()
  @Roles('user', 'admin', 'superadmin')
  @ApiOperation({ summary: 'Update your own profile (email/password)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully, returns updated doc',
  })
  async updateProfile(@Req() req, @Body() body: any) {
    return this.userService.updateProfile(req.user, body);
  }
}
