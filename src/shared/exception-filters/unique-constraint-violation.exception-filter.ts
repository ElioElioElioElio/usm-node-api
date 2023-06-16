import { UniqueConstraintViolationException } from '@mikro-orm/core';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UniqueConstraintViolationException)
export class UniqueConstraintViolationExceptionFilter
  implements ExceptionFilter
{
  regex = /("(.*?)"|'(.*?)')/gm;

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.CONFLICT;

    const keysValues = this.extractDuplicatedKeyValue(exception);

    const ressourceName = this.cleanParenthesisAndQuotes(
      exception.message.match(/"(.*?)"/)[0],
    );

    response.status(status).json({
      statusCode: status,
      message:
        'Duplicated key (' +
        keysValues.keys +
        ') with values (' +
        keysValues.values +
        ") for the ressource '" +
        ressourceName +
        "' ",
      error: 'Conflict, duplicated key',
    });
  }

  private cleanParenthesisAndQuotes(str: string) {
    return str
      .match(/("(.*?)"|'(.*?)')/gm)
      .map((value) => value.replace(/"/g, "'").replace(/'/g, ''));
  }

  private extractDuplicatedKeyValue(
    uniqueConstraintException: UniqueConstraintViolationException,
  ): KeysValues {
    const matches = uniqueConstraintException.message.match(/\((.*?)\)/gm);
    const keys = this.cleanParenthesisAndQuotes(matches[0]);
    const values = this.cleanParenthesisAndQuotes(matches[1]);
    return { keys: keys, values: values } as KeysValues;
  }
}

export type KeysValues = {
  keys: [string];
  values: [string];
};
