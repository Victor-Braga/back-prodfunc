import { VercelRequest, VercelResponse } from "@vercel/node";

// Função para configurar os cabeçalhos CORS
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Ajuste conforme necessário (evite "*" em produção)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração do CORS para requisições OPTIONS (preflight request)
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  // Configuração de CORS para outros métodos
  setCorsHeaders(res);

  try {
    // Função de login (POST) com Firebase Auth
    if (req.method === "POST" && req.url === "/api/login") {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
      const response = await fetch(firebaseAuthUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(401).json({ error: data.error.message || "Credenciais inválidas" });
      }

      return res.status(200).json({ token: data.idToken });
    }

    // Caso o método não seja POST ou o caminho da URL seja diferente
    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
}
