import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 모든 정상 응답을 { data, error: null } 형태로 통일한다.
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, { data: T; error: null }> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<{ data: T; error: null }> {
    return next.handle().pipe(map((data) => ({ data, error: null })));
  }
}
