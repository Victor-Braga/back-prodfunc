import { VercelRequest, VercelResponse } from '@vercel/node';
import * as auth from './auth';
import * as funcionarios from './funcionarios';
import * as produtos from './produtos';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const url = req.url ?? '';  // Fallback para string vazia caso seja undefined
    const method = req.method ?? ''; // Fallback para string vazia caso seja undefined

  // Rota base para testar se o backend está funcionando
  if (url === '/api') {
    return res.status(200).json({ message: 'API está funcionando corretamente' });
  }

  if (url.startsWith('/auth')) {
    // Roteamento para autenticação
    return auth.handler(req, res);
  }

  if (url.startsWith('/funcionarios')) {
    // Roteamento para funcionários
    switch (method) {
      case 'GET':
        return funcionarios.listFuncionarios(req, res);
      case 'POST':
        return funcionarios.addOrUpdateFuncionario(req, res);
      case 'DELETE':
        return funcionarios.deleteFuncionario(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido para funcionários' });
    }
  }

  if (url.startsWith('/produtos')) {
    // Roteamento para produtos
    switch (method) {
      case 'GET':
        return produtos.listProdutos(req, res);
      case 'POST':
        return produtos.addOrUpdateProduto(req, res);
      case 'DELETE':
        return produtos.deleteProduto(req, res);
      default:
        return res.status(405).json({ error: 'Método não permitido para produtos' });
    }
  }

  // Caso a rota não seja reconhecida
  return res.status(404).json({ error: 'Rota não encontrada' });
}
