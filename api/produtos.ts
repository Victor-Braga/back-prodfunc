import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from "./firebaseAdmin"; // Importa Firebase já inicializado

const db = admin.firestore();

// Função para verificar o token do usuário
const verifyToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

// Rota para listar produtos (somente os do usuário)
export const listProdutos = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const token = authorization.split(' ')[1]; // Expectativa de formato "Bearer TOKEN"
    const decodedToken = await verifyToken(token); // Verifica a validade do token
    const userId = decodedToken.uid; // ID do usuário autenticado

    // Filtra produtos apenas do usuário autenticado
    const snapshot = await db.collection('produtos').where('userId', '==', userId).get();
    const produtos = snapshot.docs.map(doc => doc.data());

    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar produtos', error: error.message });
  }
};

// Função para adicionar ou atualizar produto (associando ao usuário)
export const addOrUpdateProduto = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decodedToken = await verifyToken(token); // Verifica a validade do token
    const userId = decodedToken.uid; // ID do usuário autenticado

    const { id, nome, valor, descricao, imagem } = req.body;

    const produtoData = { nome, valor, descricao, imagem, userId };

    if (id) {
      // Atualiza produto existente
      await db.collection('produtos').doc(id).update(produtoData);
    } else {
      // Adiciona novo produto
      await db.collection('produtos').add(produtoData);
    }

    return res.status(200).json({ message: 'Produto salvo com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar produto', error: error.message });
  }
};

// Função para excluir produto (somente do usuário)
export const deleteProduto = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decodedToken = await verifyToken(token); // Verifica a validade do token
    const userId = decodedToken.uid; // ID do usuário autenticado

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID do produto não fornecido' });
    }

    const produtoRef = db.collection('produtos').doc(id);
    const produtoDoc = await produtoRef.get();
    if (produtoDoc.exists && produtoDoc.data()?.userId === userId) {
      await produtoRef.delete();
      return res.status(200).json({ message: 'Produto excluído com sucesso' });
    } else {
      return res.status(403).json({ message: 'Acesso negado. Produto não pertence a este usuário' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir produto', error: error.message });
  }
};

// Funções exportadas para uso no Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      return listProdutos(req, res);
    case 'POST':
      return addOrUpdateProduto(req, res);
    case 'DELETE':
      return deleteProduto(req, res);
    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}
