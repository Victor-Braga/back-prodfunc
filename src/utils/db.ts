// Utilitário para conexão com o Firestore

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import  app  from './firebase';
import { ApplicationError, ErrorCode } from '../types/error';

// Inicializar o Firestore
const db = getFirestore(app);

// Funções de utilidade para operações com Firestore
export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new ApplicationError({
        code: ErrorCode.NOT_FOUND,
        message: `Documento não encontrado em ${collectionName}`,
        status: 404
      });
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao buscar documento em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export const getAllDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao buscar todos os documentos em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export const createDocument = async (collectionName: string, id: string | null, data: any) => {
  try {
    const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
    await setDoc(docRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao criar documento em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao atualizar documento em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao excluir documento em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export const queryDocuments = async (collectionName: string, field: string, operator: any, value: any) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new ApplicationError({
      code: ErrorCode.DATABASE_ERROR,
      message: `Erro ao consultar documentos em ${collectionName}`,
      status: 500,
      details: error
    });
  }
};

export default db;