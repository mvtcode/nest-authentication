import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const logger = new Logger('API');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { statusCode } = context.switchToHttp().getResponse();
    const req = context.switchToHttp().getRequest();
    const { originalUrl, method, params, query, headers, body } = req;

    return next.handle().pipe(
      tap((data) => {
        logger.log(
          `${method} | ${originalUrl} | Params: ${JSON.stringify(
            params,
          )} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(
            body,
          )} | Header: ${JSON.stringify(
            headers,
          )} | ${statusCode} | Res: ${JSON.stringify(data)}`,
        );
      }),
    );
  }
}
