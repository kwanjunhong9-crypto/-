import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfigJson as any).apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfigJson as any).authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfigJson as any).projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfigJson as any).appId,
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseConfigJson as any).firestoreDatabaseId;

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
