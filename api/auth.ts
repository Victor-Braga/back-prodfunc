import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from './firebaseAdmin';

const auth = admin.auth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração manual do CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end(); // Código para preflight
  }

  // Configuração manual do CORS para outras requisições
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");


  try {
    if (req.method === 'POST' && req.url === '/api/auth/register') {
      const { email, password } = req.body;
      const userRecord = await auth.createUser({ email, password });
      return res.status(201).json({ userId: userRecord.uid });
    }

    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email } = req.body;
      const user = await auth.getUserByEmail(email);
      const token = await auth.createCustomToken(user.uid);
      return res.status(200).json({ token });
    }

    if (req.method === 'GET' && req.url === '/api/auth/validate') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const decodedToken = await admin.auth().verifyIdToken(token);
      return res.status(200).json({ uid: decodedToken.uid });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
}
