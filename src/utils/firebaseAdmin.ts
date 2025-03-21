import dotenv from 'dotenv';
dotenv.config();

import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore } from 'firebase/firestore';
import { getAuth as getClientAuth } from 'firebase/auth';

import admin from 'firebase-admin';

// Configuração para o Firebase Client (Frontend)
const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Configuração para o Firebase Admin (Backend)
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Inicializando o Firebase Client (Frontend)
const clientApp = initializeClientApp(firebaseClientConfig);
export const auth = getClientAuth(clientApp);
export const db = getClientFirestore(clientApp);

// Inicializando o Firebase Admin (Backend)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  });
}

export const authAdmin = admin.auth();
export const dbAdmin = admin.firestore();

export default admin;
