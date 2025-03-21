import { NextApiRequest, NextApiResponse } from "next";
import { authAdmin, dbAdmin } from "../../utils/firebaseAdmin"; // ✅ Firebase Admin
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é uma requisição POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Método não permitido", status: 405 } });
  }

  try {
    const { email, senha, nome } = req.body;

    // Validar dados de entrada
    if (!email || !senha || !nome) {
      throw new BadRequestError("Email, senha e nome são obrigatórios.");
    }

    if (senha.length < 6) {
      throw new BadRequestError("A senha deve ter pelo menos 6 caracteres.");
    }

    if (!email.includes("@") || !email.includes(".")) {
      throw new BadRequestError("Email inválido.");
    }

    // Criar usuário no Firebase Admin Authentication
    const user = await authAdmin.createUser({
      email,
      password: senha,
      displayName: nome,
    });

    // Criar perfil do usuário no Firestore (Admin)
    await dbAdmin.collection("perfis").doc(user.uid).set({
      id: user.uid,
      nome,
      email,
      imagem: "",
      dataCriacao: new Date().toISOString(),
    });

    // Retornar dados do usuário (sem a senha)
    return res.status(201).json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.uid,
        email: user.email,
        nome,
      },
    });
  } catch (error: any) {
    sendErrorResponse(res, error);
  }
}
