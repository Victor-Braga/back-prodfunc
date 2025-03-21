import { NextApiRequest, NextApiResponse } from "next";
import {
  getProdutoById,
  updateProduto,
  deleteProduto
} from "../../models/Produto";
import { withAuth } from "../../midleware/middleware";
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID inválido.");
    }
    
    // Buscar produto por ID (GET)
    if (req.method === "GET") {
      const produto = await getProdutoById(id);
      return res.status(200).json({ produto });
    }
    
    // Atualizar produto (PUT)
    if (req.method === "PUT") {
      const { nome, descricao, valor, quantidade, imagem } = req.body;
      
      // Validar valor e quantidade se fornecidos
      if (valor !== undefined && (typeof valor !== "number" || valor < 0)) {
        throw new BadRequestError("Valor deve ser um número positivo.");
      }
      
      if (quantidade !== undefined && (typeof quantidade !== "number" || quantidade < 0)) {
        throw new BadRequestError("Quantidade deve ser um número inteiro positivo.");
      }
      
      // Criar objeto com os campos a serem atualizados
      const updates: any = {};
      if (nome !== undefined) updates.nome = nome;
      if (descricao !== undefined) updates.descricao = descricao;
      if (valor !== undefined) updates.valor = valor;
      if (quantidade !== undefined) updates.quantidade = quantidade;
      if (imagem !== undefined) updates.imagem = imagem;
      
      // Atualizar o produto
      const updatedProduto = await updateProduto(id, updates);
      
      return res.status(200).json({ 
        message: "Produto atualizado com sucesso", 
        produto: updatedProduto 
      });
    }
    
    // Deletar produto (DELETE)
    if (req.method === "DELETE") {
      await deleteProduto(id);
      return res.status(200).json({ 
        message: "Produto deletado com sucesso", 
        id 
      });
    }
    
    // Se o método não for GET, PUT ou DELETE, retornar erro 405
    return res.status(405).json({ error: { message: "Método não permitido", status: 405 } });
  } catch (error: any) {
    sendErrorResponse(res, error);
  }
}

// Exportar o handler protegido pelo middleware de autenticação
export default withAuth(handler);