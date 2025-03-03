import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from './firebaseAdmin';

const auth = admin.auth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configuração manual do CORS
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permite todas as origens
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Métodos permitidos
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Headers permitidos

    // Responde a requisições OPTIONS (preflight do CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === 'POST' && req.url === '/api/auth/register') {
        const { email, password } = req.body;
        try {
            const userRecord = await auth.createUser({ email, password });
            return res.status(201).json({ userId: userRecord.uid });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST' && req.url === '/api/auth/login') {
        const { email, password } = req.body;
        try {
            const user = await auth.getUserByEmail(email);
            const token = await auth.createCustomToken(user.uid);
            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao autenticar usuário' });
        }
    }

    if (req.method === 'GET' && req.url === '/api/auth/validate') {
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
    }

    return res.status(405).json({ error: 'Método não permitido' });
}
