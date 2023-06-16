import { NotFoundError } from '@mikro-orm/core';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundError)
export class NotFoundErrorExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.NOT_FOUND;

    const filter = exception.message.match(/{(.*?)}/)[0];
    const ressource = exception.message.split(' ', 1)[0];

    response.status(status).json({
      statusCode: status,
      message: ressource + ',identified by ' + filter + ', not found',
      error: ressource + ' not found',
    });
  }
}
