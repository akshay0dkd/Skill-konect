import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  orderBy
} from 'firebase/firestore';

// Login function
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await ensureUserDocument(user);
    return user;
  } catch (error) {
    await logAuthError(error, 'loginUser');
    console.error('Error logging in:', error);
    throw error;
  }
};

// Registration function
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await ensureUserDocument(user);
    return user;
  } catch (error) {
    await logAuthError(error, 'registerUser');
    console.error('Error registering user:', error);
    throw error;
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    await logAuthError(error, 'logoutUser');
    console.error('Error logging out:', error);
    throw error;
  }
};

export const ensureUserDocument = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    try {
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            title: '',
            bio: '',
            skills: [],
            location: '',
            availability: 'Available',
            connections: [],
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
        });
    } catch(error) {
        await logAuthError(error, 'ensureUserDocument - create');
        throw error;
    }
  } else {
    try {
        await updateDoc(userDocRef, {
            lastUpdated: serverTimestamp()
        });
    } catch (error) {
        await logAuthError(error, 'ensureUserDocument - update');
        throw error;
    }
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() };
    } else {
      throw new Error('User profile not found.');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


// Function to fetch users by a specific skill
export const getUsersBySkill = async (skill: string) => {
  const usersRef = collection(db, 'users');
  let q;
  if (skill) {
      q = query(usersRef, where('skills', 'array-contains', skill));
  } else {
      q = query(usersRef);
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// Function to send a mentorship request
export const sendMentorshipRequest = async (fromUserId: string, toUserId: string, skill: string, message: string) => {
  await addDoc(collection(db, 'mentorship_requests'), {
    fromUserId,
    toUserId,
    skill,
    message: message || '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Function to get mentorship requests
export const getRequests = async (userId: string, type: 'sent' | 'received') => {
  const requestsRef = collection(db, 'mentorship_requests');
  const field = type === 'sent' ? 'fromUserId' : 'toUserId';
  const q = query(requestsRef, where(field, '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to update the status of a mentorship request
export const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const requestRef = doc(db, 'mentorship_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error("Request not found. It may have been deleted.");
    }

    let conversationId: string | null = null;

    if (newStatus === 'accepted') {
        const requestData = requestSnap.data();
        const fromUserRef = doc(db, 'users', requestData.fromUserId);
        const toUserRef = doc(db, 'users', requestData.toUserId);

        const fromUserSnap = await getDoc(fromUserRef);
        const toUserSnap = await getDoc(toUserRef);

        if (!fromUserSnap.exists() || !toUserSnap.exists()) {
            throw new Error("One or both users in the request no longer exist.");
        }

        await updateDoc(fromUserRef, { connections: arrayUnion(requestData.toUserId) });
        await updateDoc(toUserRef, { connections: arrayUnion(requestData.fromUserId) });

        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participants', 'in', [[requestData.fromUserId, requestData.toUserId], [requestData.toUserId, requestData.fromUserId]]));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            conversationId = querySnapshot.docs[0].id;
        } else {
            const conversationRef = doc(collection(db, 'conversations'));
            await setDoc(conversationRef, {
                id: conversationRef.id,
                participants: [requestData.fromUserId, requestData.toUserId],
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastMessageTimestamp: null
            });
            conversationId = conversationRef.id;
        }
        
        const messagesCol = collection(db, `conversations/${conversationId}/messages`);
        await addDoc(messagesCol, {
            senderId: requestData.fromUserId,
            text: `Hi! I've accepted your mentorship request for ${requestData.skill}.`,
            timestamp: serverTimestamp()
        });
    }

    await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: new Date()
    });

    return conversationId;
};

// Function to get conversations for a user
export const getConversations = async (userId: string) => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    const conversations = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const convoData = doc.data();
        const otherParticipantId = convoData.participants.find((p: string) => p !== userId);
        const userProfile: any = await getUserProfile(otherParticipantId);
        return {
            ...convoData,
            id: doc.id,
            otherUserName: userProfile.displayName,
            otherUserAvatar: userProfile.photoURL,
        };
    }));

    return conversations;
};

// Function to get messages for a conversation
export const getMessages = async (conversationId: string) => {
    const messagesCol = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesCol, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
};

// Function to send a message
export const sendMessage = async (conversationId: string, senderId: string, text: string) => {
    const messagesCol = collection(db, `conversations/${conversationId}/messages`);
    const messageRef = await addDoc(messagesCol, {
        senderId,
        text,
        timestamp: serverTimestamp()
    });
    
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp()
    });
    
    return messageRef.id;
};


export const getSkills = async () => {
    try {
        const skillsCollection = collection(db, 'skills');
        const skillsSnapshot = await getDocs(skillsCollection);
        const skillsList = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return skillsList;
    } catch (error) {
        console.error('Error fetching skills:', error);
        throw error;
    }
};

export const logAuthError = async (error: any, context: string) => {
  try {
    await addDoc(collection(db, 'authErrors'), {
      error: error.message,
      context,
      timestamp: serverTimestamp()
    });
  } catch (logError) {
    console.error('Failed to log auth error:', logError);
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<{
  displayName: string;
  photoURL: string;
  skills: string[];
  bio: string;
  title: string;
  location: string;
}>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastUpdated: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Add a skill to user profile
export const addUserSkill = async (userId: string, skill: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      skills: arrayUnion(skill),
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
};

// Remove a skill from user profile
export const removeUserSkill = async (userId: string, skill: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      skills: arrayRemove(skill),
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error removing skill:', error);
    throw error;
  }
};

export const getConnections = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const connectionIds = userData.connections || [];
            const connectionProfiles = await Promise.all(
                connectionIds.map((id: string) => getUserProfile(id))
            );
            return connectionProfiles;
        }
        return [];
    } catch (error) {
        console.error('Error fetching connections:', error);
        throw error;
    }
};

export const createTask = async (assignedBy: string, assignedTo: string, task: string, conversationId: string) => {
    await addDoc(collection(db, 'tasks'), {
        assignedBy,
        assignedTo,
        task,
        conversationId,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
};

export const getTasks = async (userId: string) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('assignedTo', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTaskStatus = async (taskId: string, status: string) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
        status,
    });
};