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
import { Funcionario } from "../types";
import { BadRequestError, NotFoundError, InternalServerError } from "../utils/errorHandler";

// Buscar todos os funcionários
export async function getAllFuncionarios(): Promise<Funcionario[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "funcionarios"));
    return querySnapshot.docs.map(doc => doc.data() as Funcionario);
  } catch (error: any) {
    throw new InternalServerError(`Erro ao buscar funcionários: ${error.message}`);
  }
}

// Buscar funcionário por ID
export async function getFuncionarioById(id: string): Promise<Funcionario> {
  try {
    const docRef = doc(db, "funcionarios", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new NotFoundError(`Funcionário com ID ${id} não encontrado.`);
    }
    
    return docSnap.data() as Funcionario;
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao buscar funcionário: ${error.message}`);
  }
}

// Criar novo funcionário
export async function createFuncionario(funcionario: Omit<Funcionario, "id">): Promise<Funcionario> {
  try {
    // Verificar se já existe um funcionário com o mesmo email
    const emailQuery = query(
      collection(db, "funcionarios"), 
      where("email", "==", funcionario.email)
    );
    
    const emailQuerySnapshot = await getDocs(emailQuery);
    if (!emailQuerySnapshot.empty) {
      throw new BadRequestError(`Já existe um funcionário com o email ${funcionario.email}.`);
    }
    
    // Adicionar o funcionário ao Firestore
    const docRef = await addDoc(collection(db, "funcionarios"), funcionario);
    
    // Atualizar o documento com o ID gerado pelo Firestore
    const newFuncionario: Funcionario = {
      id: docRef.id,
      ...funcionario
    };
    
    await updateDoc(docRef, { id: docRef.id });
    
    return newFuncionario;
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao criar funcionário: ${error.message}`);
  }
}

// Atualizar funcionário
export async function updateFuncionario(id: string, updates: Partial<Omit<Funcionario, "id">>): Promise<Funcionario> {
  try {
    const funcionarioRef = doc(db, "funcionarios", id);
    const funcionarioSnap = await getDoc(funcionarioRef);
    
    if (!funcionarioSnap.exists()) {
      throw new NotFoundError(`Funcionário com ID ${id} não encontrado.`);
    }
    
    // Verificar email duplicado se estiver sendo atualizado
    if (updates.email) {
      const emailQuery = query(
        collection(db, "funcionarios"),
        where("email", "==", updates.email),
        where("id", "!=", id)
      );
      
      const emailQuerySnapshot = await getDocs(emailQuery);
      if (!emailQuerySnapshot.empty) {
        throw new BadRequestError(`Já existe um funcionário com o email ${updates.email}.`);
      }
    }
    
    // Atualizar funcionário
    await updateDoc(funcionarioRef, updates);
    
    // Retornar funcionário atualizado
    const updatedDoc = await getDoc(funcionarioRef);
    return updatedDoc.data() as Funcionario;
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao atualizar funcionário: ${error.message}`);
  }
}

// Deletar funcionário
export async function deleteFuncionario(id: string): Promise<void> {
  try {
    const funcionarioRef = doc(db, "funcionarios", id);
    const funcionarioSnap = await getDoc(funcionarioRef);
    
    if (!funcionarioSnap.exists()) {
      throw new NotFoundError(`Funcionário com ID ${id} não encontrado.`);
    }
    
    await deleteDoc(funcionarioRef);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Erro ao deletar funcionário: ${error.message}`);
  }
}