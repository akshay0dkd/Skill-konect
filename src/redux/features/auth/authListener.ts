import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../firebase';
import { setUser } from './authSlice';
import { AppDispatch } from '../../store';
import { getUserProfile } from '../../../services/api';

export const setupAuthListener = (dispatch: AppDispatch) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // User is signed in
      const userProfile = await getUserProfile(user.uid);
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userProfile
      }));
    } else {
      // User is signed out
      dispatch(setUser(null));
    }
  });
};
