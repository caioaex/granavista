import { Body, Controller, Headers, Post, Res } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Headers('x-client-type') clientType: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto);

    return this.handleAuthResponse(result, clientType, res);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('x-client-type') clientType: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);

    return this.handleAuthResponse(result, clientType, res);
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });
  }

  private handleAuthResponse(
    result: AuthResponseDto,
    clientType: string,
    res: Response,
  ): AuthResponseDto {
    if (clientType === 'web') {
      this.setRefreshCookie(res, result.refreshToken!);
      const { refreshToken, ...responseWithoutRefresh } = result;
      return responseWithoutRefresh;
    }
    return result;
  }
}
