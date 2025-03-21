import { NextApiRequest, NextApiResponse } from "next";
import { 
  getAllProdutos, 
  createProduto 
} from "../../models/Produto";
import { withAuth } from "../../midleware/middleware";
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Listar todos os produtos (GET)
    if (req.method === "GET") {
      const produtos = await getAllProdutos();
      return res.status(200).json({ produtos });
    }
    
    // Criar um novo produto (POST)
    if (req.method === "POST") {
      const { nome, descricao, valor, quantidade, imagem } = req.body;
      
      // Validar dados obrigatórios
      if (!nome || !descricao || valor === undefined || quantidade === undefined) {
        throw new BadRequestError("Nome, descrição, valor e quantidade são obrigatórios.");
      }
      
      // Validar valor e quantidade
      if (typeof valor !== "number" || valor < 0) {
        throw new BadRequestError("Valor deve ser um número positivo.");
      }
      
      if (typeof quantidade !== "number" || quantidade < 0) {
        throw new BadRequestError("Quantidade deve ser um número inteiro positivo.");
      }
      
      const newProduto = await createProduto({
        nome,
        descricao,
        valor,
        quantidade,
        imagem: imagem || ""
      });
      
      return res.status(201).json({ 
        message: "Produto criado com sucesso", 
        produto: newProduto 
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