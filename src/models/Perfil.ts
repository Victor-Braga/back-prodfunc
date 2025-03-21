import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
  } from "firebase/firestore";
  import { db } from "../utils/firebase";
  import { Perfil } from "../types";
  import { NotFoundError, InternalServerError } from "../utils/errorHandler";
  
  export async function getPerfilById(id: string): Promise<Perfil> {
    try {
      const perfilDoc = await getDoc(doc(db, "perfis", id));
      
      if (!perfilDoc.exists()) {
        throw new NotFoundError(`Perfil com ID ${id} não encontrado.`);
      }
      
      return perfilDoc.data() as Perfil;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError(`Erro ao buscar perfil: ${error.message}`);
    }
  }
  
  export async function createPerfil(perfil: Omit<Perfil, "id">, id: string): Promise<Perfil> {
    try {
      const newPerfil: Perfil = {
        id,
        ...perfil
      };
      
      await setDoc(doc(db, "perfis", id), newPerfil);
      return newPerfil;
    } catch (error: any) {
      throw new InternalServerError(`Erro ao criar perfil: ${error.message}`);
    }
  }
  
  export async function updatePerfil(id: string, updates: Partial<Omit<Perfil, "id">>): Promise<Perfil> {
    try {
      // Verificar se o perfil existe
      const perfilDoc = await getDoc(doc(db, "perfis", id));
      
      if (!perfilDoc.exists()) {
        throw new NotFoundError(`Perfil com ID ${id} não encontrado.`);
      }
      
      // Atualizar apenas os campos fornecidos
      await updateDoc(doc(db, "perfis", id), updates);
      
      // Retornar o perfil atualizado
      const updatedDoc = await getDoc(doc(db, "perfis", id));
      return updatedDoc.data() as Perfil;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError(`Erro ao atualizar perfil: ${error.message}`);
    }
  }