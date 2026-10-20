
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(
    AllExceptionsFilter.name,
  );

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();

    // Tentukan status HTTP berdasarkan jenis error.
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    let message = 'Terjadi kesalahan pada server';
    let errors: string[] | undefined;

    // Tangani error HTTP dengan pesan berbentuk string.
    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (
      errorResponse &&
      typeof errorResponse === 'object' &&
      'message' in errorResponse
    ) {
      const detail = errorResponse.message;

      // Tangani daftar pesan dari ValidationPipe.
      if (Array.isArray(detail)) {
        message = 'Validasi gagal';
        errors = detail.map(String);
      } else if (typeof detail === 'string') {
        message = detail;
      }
    }

    // Jangan tampilkan detail internal untuk error server.
    if (statusCode >= 500) {
      this.logger.error(exception);
      message = 'Terjadi kesalahan pada server';
      errors = undefined;
    }

    const result = {
      success: false,
      statusCode,
      message,
      data: null,
      ...(errors ? { errors } : {}),
    };

    httpAdapter.reply(
      context.getResponse(),
      result,
      statusCode,
    );
  }
}
