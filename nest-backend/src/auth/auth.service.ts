import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../user/entities/user.entity';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh.token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private rtModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    return user;
  }

  async login(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      aud: user.tenant_id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXP || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXP || '7d',
    });

    await this.rtModel.create({
      token: refreshToken,
      userId: payload.sub,
      tenantId: payload.aud,
      role: payload.role,
    });

    return { accessToken, refreshToken };
  }

  async refresh(oldToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(oldToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const existingToken = await this.rtModel.findOne({ token: oldToken });
    if (!existingToken) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    await this.rtModel.deleteOne({ token: oldToken });

    const newPayload = {
      sub: payload.sub,
      aud: payload.aud,
      role: payload.role,
    };

    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: process.env.ACCESS_TOKEN_EXP || '15m',
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: process.env.REFRESH_TOKEN_EXP || '7d',
    });

    await this.rtModel.create({
      token: newRefreshToken,
      userId: newPayload.sub,
      tenantId: newPayload.aud,
      role: newPayload.role,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async register(
    email: string,
    password: string,
    tenantId: string,
    role: string = 'user',
  ) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashed,
      tenant_id: tenantId,
      role,
    });
    return newUser.save();
  }
}
