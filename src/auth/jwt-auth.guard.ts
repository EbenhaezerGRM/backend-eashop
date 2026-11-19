
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';

type UserRole = 'USER' | 'ADMIN';

interface JwtPayload {
  sub: number;
  email: string;
  role?: UserRole;
}

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization =
      request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token tidak ditemukan',
      );
    }

    const token = authorization.slice(
      'Bearer '.length,
    );

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
        );

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kedaluwarsa',
      );
    }
  }
}
