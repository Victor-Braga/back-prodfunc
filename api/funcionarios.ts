import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Inicialização do Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

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

// Rota para listar funcionários (somente os do usuário)
export const listFuncionarios = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const token = authorization.split(' ')[1]; // Expectativa de formato "Bearer TOKEN"
    const decodedToken = await verifyToken(token); // Verifica a validade do token
    const userId = decodedToken.uid; // ID do usuário autenticado

    // Filtra funcionários apenas do usuário autenticado
    const snapshot = await db.collection('funcionarios').where('userId', '==', userId).get();
    const funcionarios = snapshot.docs.map(doc => doc.data());

    return res.status(200).json(funcionarios);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar funcionários', error: error.message });
  }
};

// Função para adicionar ou atualizar funcionário (associando ao usuário)
export const addOrUpdateFuncionario = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decodedToken = await verifyToken(token); // Verifica a validade do token
    const userId = decodedToken.uid; // ID do usuário autenticado

    const { id, nome, funcao, setor, salario } = req.body;

    const funcionarioData = { nome, funcao, setor, salario, userId };

    if (id) {
      // Atualiza funcionário existente
      await db.collection('funcionarios').doc(id).update(funcionarioData);
    } else {
      // Adiciona novo funcionário
      await db.collection('funcionarios').add(funcionarioData);
    }

    return res.status(200).json({ message: 'Funcionário salvo com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar funcionário', error: error.message });
  }
};

// Função para excluir funcionário (somente do usuário)
export const deleteFuncionario = async (req: VercelRequest, res: VercelResponse) => {
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
      return res.status(400).json({ message: 'ID do funcionário não fornecido' });
    }

    const funcionarioRef = db.collection('funcionarios').doc(id);
    const funcionarioDoc = await funcionarioRef.get();
    if (funcionarioDoc.exists && funcionarioDoc.data()?.userId === userId) {
      await funcionarioRef.delete();
      return res.status(200).json({ message: 'Funcionário excluído com sucesso' });
    } else {
      return res.status(403).json({ message: 'Acesso negado. Funcionário não pertence a este usuário' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir funcionário', error: error.message });
  }
};
