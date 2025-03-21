import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { Produto } from "../types";
import { BadRequestError, NotFoundError, InternalServerError } from "../utils/errorHandler";

// Buscar todos os produtos
export async function getAllProdutos(): Promise<Produto[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    return querySnapshot.docs.map(doc => doc.data() as Produto);
  } catch (error: any) {
    throw new InternalServerError(`Erro ao buscar produtos: ${error.message}`);
  }
}

// Buscar produto por ID
export async function getProdutoById(id: string): Promise<Produto> {
  try {
    const docRef = doc(db, "produtos", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new NotFoundError(`Produto com ID ${id} não encontrado.`);
    }
    
    return docSnap.data() as Produto;
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao buscar produto: ${error.message}`);
  }
}

// Criar novo produto
export async function createProduto(produto: Omit<Produto, "id">): Promise<Produto> {
  try {
    // Validações básicas
    if (!produto.nome || produto.nome.trim() === "") {
      throw new BadRequestError("Nome do produto é obrigatório.");
    }
    
    if (produto.valor < 0) {
      throw new BadRequestError("Valor do produto não pode ser negativo.");
    }
    
    if (produto.quantidade < 0) {
      throw new BadRequestError("Quantidade em estoque não pode ser negativa.");
    }
    
    // Adicionar o produto ao Firestore
    const docRef = await addDoc(collection(db, "produtos"), produto);
    
    // Atualizar o documento com o ID gerado pelo Firestore
    const newProduto: Produto = {
      id: docRef.id,
      ...produto
    };
    
    await updateDoc(docRef, { id: docRef.id });
    
    return newProduto;
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao criar produto: ${error.message}`);
  }
}

// Atualizar produto
export async function updateProduto(id: string, updates: Partial<Omit<Produto, "id">>): Promise<Produto> {
  try {
    const produtoRef = doc(db, "produtos", id);
    const produtoSnap = await getDoc(produtoRef);
    
    if (!produtoSnap.exists()) {
      throw new NotFoundError(`Produto com ID ${id} não encontrado.`);
    }
    
    // Validações para os campos sendo atualizados
    if (updates.nome !== undefined && updates.nome.trim() === "") {
      throw new BadRequestError("Nome do produto não pode ser vazio.");
    }
    
    if (updates.valor !== undefined && updates.valor < 0) {
      throw new BadRequestError("Valor do produto não pode ser negativo.");
    }
    
    if (updates.quantidade !== undefined && updates.quantidade < 0) {
      throw new BadRequestError("Quantidade em estoque não pode ser negativa.");
    }
    
    // Atualizar produto
    await updateDoc(produtoRef, updates);
    
    // Retornar produto atualizado
    const updatedDoc = await getDoc(produtoRef);
    return updatedDoc.data() as Produto;
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao atualizar produto: ${error.message}`);
  }
}

// Deletar produto
export async function deleteProduto(id: string): Promise<void> {
  try {
    const produtoRef = doc(db, "produtos", id);
    const produtoSnap = await getDoc(produtoRef);
    
    if (!produtoSnap.exists()) {
      throw new NotFoundError(`Produto com ID ${id} não encontrado.`);
    }
    
    await deleteDoc(produtoRef);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao deletar produto: ${error.message}`);
  }
}