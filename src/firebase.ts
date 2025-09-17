import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgDqD_0BMjozzoHDljocO9-RPAOMZnrVE",
  authDomain: "skill-konnect.firebaseapp.com",
  projectId: "skill-konnect",
  storageBucket: "skill-konnect.appspot.com",
  messagingSenderId: "762769596931",
  appId: "1:762769596931:web:5af73c44d5a09938a5a436",
  measurementId: "G-XVR92P4N7J"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Get references to the services
const auth = getAuth(app);

const initializeFirebase = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("Firebase persistence enabled");
  } catch (error) {
    if (error.code == 'failed-precondition') {
      console.warn("Firebase persistence failed: Multiple tabs open?");
    } else if (error.code == 'unimplemented') {
      console.log("Firebase persistence not available in this browser.");
    }
  }
};

export { app, auth, db, initializeFirebase };
