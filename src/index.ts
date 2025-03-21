import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permite todas as origens
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Métodos permitidos
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Headers permitidos

    // Responde a requisições OPTIONS (preflight do CORS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    return res.status(200).json({ message: "Backend funcionando! 🚀" });
}
