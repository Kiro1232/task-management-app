import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /auth/register — Create a new user account
   * Issues an HTTP-Only cookie on success to start the session immediately.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.register(dto);
    this.setAuthCookie(res, token);
    return { message: 'Account created successfully', user };
  }

  /**
   * POST /auth/login — Authenticate an existing user
   * On success, issues an HTTP-Only cookie containing the JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successful' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto);
    this.setAuthCookie(res, token);
    return { message: 'Login successful', user };
  }

  /**
   * POST /auth/logout — Invalidate the session by clearing the cookie
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const sameSite: 'lax' | 'strict' | 'none' = isProduction ? 'none' : 'lax';
    res.clearCookie('access_token', { httpOnly: true, secure: isProduction, sameSite, path: '/' });
    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/me — Return the currently authenticated user's profile
   * Used by the frontend to restore session state on page reload.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current authenticated user profile' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    return { user };
  }

  /**
   * Sets the JWT as an HTTP-Only cookie.
   * - httpOnly: true     → Inaccessible to JavaScript (XSS protection)
   * - secure: true       → HTTPS-only in production
   * - sameSite: strict   → CSRF protection in production
   */
  private setAuthCookie(res: Response, token: string): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    // For cross-site requests (frontend deployed on a different origin), browsers
    // require SameSite='none' and Secure=true. In development (same-origin or
    // localhost) we keep a more permissive 'lax' value.
    const sameSite: 'lax' | 'strict' | 'none' = isProduction ? 'none' : 'lax';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
