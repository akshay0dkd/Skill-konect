import { firestore } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';

export const createUserProfile = async (userId: string, data: any) => {
  await setDoc(doc(firestore, 'users', userId), data);
};

export const getUserProfile = async (userId: string) => {
  const docRef = doc(firestore, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  await updateDoc(doc(firestore, 'users', userId), data);
};

export const getAllUsers = async () => {
  const usersCollection = collection(firestore, 'users');
  const usersSnap = await getDocs(usersCollection);
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchUsers = async (searchTerm: string) => {
  const usersCollection = collection(firestore, 'users');
  const q = query(usersCollection, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff'));
  const usersSnap = await getDocs(q);
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addConnection = async (userId: string, connectionId: string) => {
    const connectionRef = doc(firestore, 'users', userId, 'connections', connectionId);
    await setDoc(connectionRef, { connectedAt: new Date() });
};

export const getConnections = async (userId: string) => {
    const connectionsCol = collection(firestore, 'users', userId, 'connections');
    const connectionsSnap = await getDocs(connectionsCol);
    return connectionsSnap.docs.map(doc => doc.id);
};
