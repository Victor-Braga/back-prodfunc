import { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "./firebaseAdmin"; // Importa Firebase já inicializado

const auth = admin.auth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST' && req.url === '/api/auth/register') {
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
  } else if (req.method === "POST" && req.url === "/api/auth/login") {
    const { email, password } = req.body;
    try {
      // Verificação de usuário e senha deve ser feita no frontend com Firebase Auth
      // Aqui, apenas geramos um token de login após autenticação com Firebase
      const user = await auth.getUserByEmail(email);
      // Para validar o login, você precisa usar o SDK do Firebase Auth no frontend para verificar a senha
      const token = await auth.createCustomToken(user.uid); // Criação do token personalizado após login
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
