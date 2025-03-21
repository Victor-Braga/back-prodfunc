import { NextApiResponse } from "next";

// Mapeamento de códigos de erro do Firebase para mensagens amigáveis
export const authErrorMessages: { [key: string]: string } = {
  "auth/email-already-in-use": "Este email já está sendo utilizado por outra conta.",
  "auth/invalid-email": "O endereço de email fornecido não é válido.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/user-not-found": "Usuário não encontrado. Verifique seu email.",
  "auth/wrong-password": "Senha incorreta. Por favor, tente novamente.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/network-request-failed": "Falha na conexão. Verifique sua internet e tente novamente.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/operation-not-allowed": "Operação não permitida.",
  // Adicione outros códigos de erro conforme necessário
};

// Classe base para erros de API
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

// Errors específicos
export class BadRequestError extends ApiError {
  constructor(message: string, code: string = "bad_request") {
    super(message, code, 400);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Não autorizado", code: string = "unauthorized") {
    super(message, code, 401);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, code: string = "not_found") {
    super(message, code, 404);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "Erro interno do servidor", code: string = "internal_error") {
    super(message, code, 500);
  }
}

// Função para tratar erros de autenticação do Firebase
export function handleFirebaseAuthError(error: any): ApiError {
  const code = error.code || "unknown_error";
  const message = authErrorMessages[code] || error.message || "Ocorreu um erro durante a autenticação.";
  
  if (code === "auth/user-not-found" || code === "auth/wrong-password") {
    return new UnauthorizedError(message, code);
  }
  
  if (code === "auth/email-already-in-use" || code === "auth/invalid-email" || code === "auth/weak-password") {
    return new BadRequestError(message, code);
  }
  
  return new InternalServerError(message, code);
}

// Função para enviar respostas de erro padronizadas
export function sendErrorResponse(res: NextApiResponse, error: any): void {
  console.error("API Error:", error);
  
  let apiError: ApiError;
  
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error.code && error.code.startsWith("auth/")) {
    apiError = handleFirebaseAuthError(error);
  } else {
    apiError = new InternalServerError(
      error.message || "Ocorreu um erro inesperado.",
      error.code || "internal_error"
    );
  }
  
  res.status(apiError.status).json({
    error: {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status
    }
  });
}