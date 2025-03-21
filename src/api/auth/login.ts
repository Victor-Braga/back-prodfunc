import { NextApiRequest, NextApiResponse } from "next";
import { authAdmin, dbAdmin } from "../../utils/firebaseAdmin"; // ✅ Firebase Admin
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Método não permitido", status: 405 } });
  }

  try {
    const { email, senha } = req.body;

    // Validação dos dados de entrada
    if (!email || !senha) {
      throw new BadRequestError("Email e senha são obrigatórios.");
    }

    // Autenticar usuário no Firebase Admin Auth
    const user = await authAdmin.getUserByEmail(email);

    // Criar token JWT para login
    const token = await authAdmin.createCustomToken(user.uid);

    // Buscar perfil do Firestore (Admin)
    const perfilDocRef = dbAdmin.collection("perfis").doc(user.uid);
    const perfilDocSnap = await perfilDocRef.get();

    // Se não existir, criar um perfil básico
    if (!perfilDocSnap.exists) {
      const novoPerfil = {
        id: user.uid,
        nome: user.displayName || email.split("@")[0],
        email,
        imagem: "",
        dataCriacao: new Date().toISOString(),
      };

      await perfilDocRef.set(novoPerfil);

      return res.status(200).json({
        message: "Login realizado com sucesso",
        user: novoPerfil,
        token,
      });
    }

    // Retornar dados do usuário autenticado
    const perfilData = perfilDocSnap.data();
    return res.status(200).json({
      message: "Login realizado com sucesso",
      user: {
        id: user.uid,
        email: user.email,
        nome: perfilData?.nome || email.split("@")[0],
        imagem: perfilData?.imagem || null,
      },
      token,
    });
  } catch (error: any) {
    sendErrorResponse(res, error);
  }
}
