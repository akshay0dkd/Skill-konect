import { login, register, logout } from './src/redux/features/auth/authSlice';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './src/firebase'; // Make sure this path is correct

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const TEST_DISPLAY_NAME = 'Test User';

// Initialize Firebase app for testing
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
connectAuthEmulator(auth, 'http://localhost:9099');
connectFirestoreEmulator(db, 'http://localhost:8080');

beforeEach(async () => {
  // Clear the database and auth before each test
  await signOut(auth).catch(() => {});
  await fetch('http://localhost:8080/emulator/v1/projects/skill-swap-dev-c1524/databases/(default)/documents', { method: 'DELETE' });
});

describe('Auth flow', () => {

  it('should register a new user and create a firestore document', async () => {
    // Dispatch register action
    const dispatch = jest.fn();
    const thunk = register({ email: TEST_EMAIL, password: TEST_PASSWORD, displayName: TEST_DISPLAY_NAME });
    await thunk(dispatch, () => {}, undefined);
    
    // Verify user is created in Auth
    const user = auth.currentUser;
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_EMAIL);

    // Verify document is created in Firestore
    const userDocRef = doc(db, 'users', user!.uid);
    const userDoc = await getDoc(userDocRef);
    expect(userDoc.exists()).toBe(true);
    expect(userDoc.data()?.displayName).toBe(TEST_DISPLAY_NAME);
  });

  it('should login an existing user', async () => {
    // Create a user first
    await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);

    // Dispatch login action
    const dispatch = jest.fn();
    const thunk = login({ email: TEST_EMAIL, password: TEST_PASSWORD });
    await thunk(dispatch, () => {}, undefined);

    // Verify user is logged in
    expect(auth.currentUser).not.toBeNull();
  });

  it('should update lastLogin on login', async () => {
    // Create user and initial doc
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { lastLogin: new Date(0) });

    // Dispatch login action
    const dispatch = jest.fn();
    const thunk = login({ email: TEST_EMAIL, password: TEST_PASSWORD });
    await thunk(dispatch, () => {}, undefined);

    // Verify lastLogin is updated
    const userDoc = await getDoc(userDocRef);
    expect(userDoc.data()?.lastLogin.toDate().getTime()).toBeGreaterThan(0);
  });

  it('should create a document on login for a user that doesn't have one', async () => {
    // Create user in auth but not firestore
    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const user = userCredential.user;

    // Dispatch login action
    const dispatch = jest.fn();
    const thunk = login({ email: TEST_EMAIL, password: TEST_PASSWORD });
    await thunk(dispatch, () => {}, undefined);

    // Verify document is created
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    expect(userDoc.exists()).toBe(true);
  });

  it('should reject login with invalid credentials', async () => {
    const dispatch = jest.fn();
    const thunk = login({ email: TEST_EMAIL, password: 'wrongpassword' });
    const result = await thunk(dispatch, () => {}, undefined);

    expect(result.meta.requestStatus).toBe('rejected');
  });

  it('should logout a user', async () => {
    // Login first
    await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    expect(auth.currentUser).not.toBeNull();

    // Dispatch logout action
    const dispatch = jest.fn();
    const thunk = logout();
    await thunk(dispatch, () => {}, undefined);

    // Verify user is logged out
    expect(auth.currentUser).toBeNull();
  });

});