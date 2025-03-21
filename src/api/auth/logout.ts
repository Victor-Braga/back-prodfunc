import { NextApiRequest, NextApiResponse } from "next";
import { sendErrorResponse } from "../../utils/errorHandler";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Método não permitido", status: 405 } });
  }

  try {
    // Não há nada para "deslogar" no backend, apenas respondemos com sucesso
    return res.status(200).json({
      message: "Logout realizado com sucesso"
    });
  } catch (error: any) {
    sendErrorResponse(res, error);
  }
}
