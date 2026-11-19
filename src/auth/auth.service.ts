
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { RegisterDto } from './dto/register.dto';

import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          addresses: {
            create: {
              recipientName: dto.address.recipientName,
              phone: dto.address.phone,
              street: dto.address.street,
              city: dto.address.city,
              province: dto.address.province,
              district: dto.address.district,
              postalCode: dto.address.postalCode,
              notes: dto.address.notes,
              isDefault: true,
            },
          },
        },
        include: {
          addresses: true,
        },
      });

      const {
        passwordHash: _passwordHash,
        ...safeUser
      } = user;

      return {
        message: 'Registrasi berhasil',
        user: safeUser,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Email sudah terdaftar',
        );
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Email atau password salah',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Email atau password salah',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login berhasil',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            recipientName: true,
            phone: true,
            street: true,
            city: true,
            province: true,
            district: true,
            postalCode: true,
            notes: true,
            isDefault: true,
          },
        },
        seller: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User tidak ditemukan',
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      addresses: user.addresses,
      sellerId: user.seller?.id ?? 0,
    };
  }
}
