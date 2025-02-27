import { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "./firebaseAdmin"; // Importa Firebase já inicializado

const auth = admin.auth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  } else if (req.method === "GET" && req.url === "/api/auth/validate") {
    // Validação do token
    const token = req.headers['authorization']?.split(' ')[1]; // Pega o token da autorização
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
      // Verifica o token com o Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      return res.status(200).json({ uid: decodedToken.uid });
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}
