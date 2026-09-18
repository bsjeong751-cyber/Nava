import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// 사용자에게 "API Error 500" 같은 개발자 오류 메시지를 노출하지 않는다 (기획서 51항).
const FALLBACK_MESSAGE = '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? this.extractMessage(exception)
      : FALLBACK_MESSAGE;

    if (!isHttpException) {
      this.logger.error(exception);
    }

    response.status(status).json({
      data: null,
      error: { message, status },
    });
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body && 'message' in body) {
      const m = (body as { message: string | string[] }).message;
      return Array.isArray(m) ? m.join(', ') : m;
    }
    return FALLBACK_MESSAGE;
  }
}
