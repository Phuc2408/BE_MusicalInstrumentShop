import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { BackendRes } from '../types/common.type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const res = exceptionResponse as { message: string | string[], error: string };
      message = res.message || exception.message;
      error = res.error || exception.name;
    } else {
      message = exceptionResponse as string || exception.message;
      error = exception.name;
    }

    const errorResponse: BackendRes<any> = {
      statusCode: status,
      message: message,
      error: error,
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}