import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Successful, returns { accessToken, refreshToken }',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if invalid credentials',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'MySecret123' },
      },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Rotates refresh token, returns new token pair',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'oldRefreshTokenXYZ' },
      },
    },
  })
  async refresh(@Body() body: { token: string }) {
    return this.authService.refresh(body.token);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (example or dev usage)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'newuser@example.com' },
        password: { type: 'string', example: 'MySecret123' },
        tenantId: { type: 'string', example: 'tenant_abc' },
        role: {
          type: 'string',
          example: 'user',
          description: 'Role can be user/admin/superadmin (optional)',
        },
      },
    },
  })
  async register(@Body() body: RegisterDto) {
    const { email, password, tenantId, role } = body;
    return this.authService.register(email, password, tenantId, role);
  }
}
