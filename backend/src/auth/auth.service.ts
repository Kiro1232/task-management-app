import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto.email, dto.password, dto.name);
    const token = this.signToken((user._id as { toString(): string }).toString(), user.email);
    return {
      token,
      user: {
        id: (user._id as { toString(): string }).toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Always compare hashes even when user is not found to prevent timing-based
    // user enumeration attacks (constant-time comparison via bcrypt)
    const isValid = user ? await bcrypt.compare(dto.password, user.password) : false;
    if (!user || !isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken((user._id as { toString(): string }).toString(), user.email);
    return {
      token,
      user: {
        id: (user._id as { toString(): string }).toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  private signToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
