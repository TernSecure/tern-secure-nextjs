import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    DocumentData
  } from 'firebase/firestore';
  import { FirebaseInitializer } from './config';
  
  export class FirestoreService {
    static async create<T extends DocumentData>(
      collectionName: string,
      data: T,
      id?: string
    ): Promise<string> {
      const db = getFirestore(FirebaseInitializer.getApp());
      const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
      await setDoc(docRef, data);
      return docRef.id;
    }
  
    static async get<T>(collectionName: string, id: string): Promise<T | null> {
      const db = getFirestore(FirebaseInitializer.getApp());
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as T : null;
    }
  
    static async query<T>(
      collectionName: string,
      field: string,
      operator: any,
      value: any
    ): Promise<T[]> {
      const db = getFirestore(FirebaseInitializer.getApp());
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    }
  }