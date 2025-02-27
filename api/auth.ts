import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from './firebaseAdmin';
import cors from 'cors';

// Configuração do CORS
const corsMiddleware = cors({
  origin: 'https://prodfunc.vercel.app', // Permite apenas esse domínio
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const auth = admin.auth();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Aplica o middleware CORS (responde à requisição OPTIONS)
  corsMiddleware(req, res, async () => {
    if (req.method === 'POST' && req.url === '/api/auth/register') {
      const { email, password } = req.body;
      try {
        const userRecord = await auth.createUser({
          email,
          password,
        });
        return res.status(201).json({ userId: userRecord.uid });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email, password } = req.body;
      try {
        const user = await auth.getUserByEmail(email);
        const token = await auth.createCustomToken(user.uid);
        return res.status(200).json({ token });
      } catch (error) {
        return res.status(500).json({ error: 'Erro ao autenticar usuário' });
      }
    } else if (req.method === 'GET' && req.url === '/api/auth/validate') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return res.status(200).json({ uid: decodedToken.uid });
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
    } else {
      return res.status(405).json({ error: 'Método não permitido' });
    }
  });
}
