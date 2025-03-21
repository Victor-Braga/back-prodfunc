import { NextApiRequest, NextApiResponse } from "next";
import { authAdmin } from "../utils/firebaseAdmin";
import { UnauthorizedError, sendErrorResponse } from "../utils/errorHandler";

export type NextApiHandlerWithAuth = (
  req: NextApiRequest & { uid?: string },
  res: NextApiResponse
) => Promise<void> | void;

export async function withAuth(
  handler: NextApiHandlerWithAuth
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Verificar se o token está presente no cabeçalho de autorização
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Token de autenticação não fornecido");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new UnauthorizedError("Token de autenticação inválido");
      }

      try {
        // Verificar o token com o Firebase
        const decodedToken = await authAdmin.verifyIdToken(token);
        
        // Adicionar o UID do usuário ao objeto de requisição
        (req as any).uid = decodedToken.uid;
        
        // Chamar o handler original
        return await handler(req as NextApiRequest & { uid: string }, res);
      } catch (error) {
        throw new UnauthorizedError("Token de autenticação inválido ou expirado");
      }
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };
}