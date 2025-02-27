import { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const auth = admin.auth();

export const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    const { email, password } = req.body;
    try {
      // Criar usuário no Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
      });
      return res.status(201).json({ userId: userRecord.uid });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    const { email, password } = req.body;
    try {
      const user = await auth.getUserByEmail(email);
      // Aqui você deve fazer a verificação de senha (isto pode ser feito no frontend com Firebase Auth)
      // Após verificar a senha, gere um token para o usuário logado
      const token = await auth.createCustomToken(user.uid);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao autenticar usuário" });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}
