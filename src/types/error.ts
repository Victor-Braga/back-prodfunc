// types/error.ts
import { ErrorResponse } from './index';

export enum ErrorCode {
  AUTHENTICATION_ERROR = 'auth/error',
  UNAUTHORIZED = 'auth/unauthorized',
  NOT_FOUND = 'resource/not-found',
  VALIDATION_ERROR = 'validation/error',
  DATABASE_ERROR = 'database/error',
  UNKNOWN_ERROR = 'unknown/error'
}

export class ApplicationError extends Error implements ErrorResponse {
  code: string;
  status: number;
  details?: any;

  constructor(options: {
    code: string;
    message: string;
    status: number;
    details?: any;
  }) {
    super(options.message);
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.name = 'ApplicationError';
  }
}

export const createErrorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof ApplicationError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    code: 'unknown/error',
    status: 500
  };
};