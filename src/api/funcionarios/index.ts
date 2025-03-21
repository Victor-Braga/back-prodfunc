import { NextApiRequest, NextApiResponse } from "next";
import { 
  getAllFuncionarios, 
  createFuncionario 
} from "../../models/Funcionario";
import { withAuth } from "../../midleware/middleware";
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Listar todos os funcionários (GET)
    if (req.method === "GET") {
      const funcionarios = await getAllFuncionarios();
      return res.status(200).json({ funcionarios });
    }
    
    // Criar um novo funcionário (POST)
    if (req.method === "POST") {
      const { nome, email, numero, salario, imagem } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !email || !numero || salario === undefined) {
        throw new BadRequestError("Nome, email, número e salário são obrigatórios.");
      }
      
      // Validar formato do email
      if (!email.includes("@") || !email.includes(".")) {
        throw new BadRequestError("Formato de email inválido.");
      }
      
      // Validar salário
      if (typeof salario !== "number" || salario < 0) {
        throw new BadRequestError("Salário deve ser um número positivo.");
      }
      
      const newFuncionario = await createFuncionario({
        nome,
        email,
        numero,
        salario,
        imagem: imagem || ""
      });
      
      return res.status(201).json({ 
        message: "Funcionário criado com sucesso", 
        funcionario: newFuncionario 
      });
    }
    
    // Se o método não for GET ou POST, retornar erro 405
    return res.status(405).json({ error: { message: "Método não permitido", status: 405 } });
  } catch (error: any) {
    sendErrorResponse(res, error);
  }
}

// Exportar o handler protegido pelo middleware de autenticação
export default withAuth(handler);