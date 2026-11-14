import {
  Body,
  Controller,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
login(
  @Body(new ValidationPipe({ whitelist: true, transform: true }))
  dto: LoginDto,
) {
  return this.authService.login(dto);
}

@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Req() req: AuthenticatedRequest) {
  return this.authService.getProfile(req.user.sub);
}
}