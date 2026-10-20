
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

import { RESPONSE_MESSAGE_KEY } from
  '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {

    const message =
      this.reflector.getAllAndOverride<string>(
        RESPONSE_MESSAGE_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      ) ?? 'Permintaan berhasil';

    const response = context
      .switchToHttp()
      .getResponse();

    return next.handle().pipe(
      map((data) => {
        const result = {
          success: true,
          statusCode: response.statusCode,
          message,
          ...(Array.isArray(data)
            ? { total: data.length }
            : {}),
          data,
        };

        return result;
      }),
    );
  }
}