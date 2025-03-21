import { NextApiRequest, NextApiResponse } from "next";
import {
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario
} from "../../models/Funcionario";
import { withAuth } from "../../midleware/middleware";
import { BadRequestError, sendErrorResponse } from "../../utils/errorHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID inválido.");
    }
    
    // Buscar funcionário por ID (GET)
    if (req.method === "GET") {
      const funcionario = await getFuncionarioById(id);
      return res.status(200).json({ funcionario });
    }
    
    // Atualizar funcionário (PUT)
    if (req.method === "PUT") {
      const { nome, email, numero, salario, imagem } = req.body;
      
      // Validar formato do email se fornecido
      if (email && (!email.includes("@") || !email.includes("."))) {
        throw new BadRequestError("Formato de email inválido.");
      }
      
      // Validar salário se fornecido
      if (salario !== undefined && (typeof salario !== "number" || salario < 0)) {
        throw new BadRequestError("Salário deve ser um número positivo.");
      }
      
      // Criar objeto com os campos a serem atualizados
      const updates: any = {};
      if (nome !== undefined) updates.nome = nome;
      if (email !== undefined) updates.email = email;
      if (numero !== undefined) updates.numero = numero;
      if (salario !== undefined) updates.salario = salario;
      if (imagem !== undefined) updates.imagem = imagem;
      
      // Atualizar o funcionário
      const updatedFuncionario = await updateFuncionario(id, updates);
      
      return res.status(200).json({ 
        message: "Funcionário atualizado com sucesso", 
        funcionario: updatedFuncionario 
      });
    }
    
    // Deletar funcionário (DELETE)
    if (req.method === "DELETE") {
      await deleteFuncionario(id);
      return res.status(200).json({ 
        message: "Funcionário deletado com sucesso", 
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