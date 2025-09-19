import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { setUser, setLoading, setError } from './authSlice';
import { AppDispatch } from '../store';
import { getUserProfile } from '../../../services/api';

export const setupAuthListener = (dispatch: AppDispatch) => {
  dispatch(setLoading(true)); // Ensure loading starts when the listener is set up
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userProfile = await getUserProfile(user.uid);
        dispatch(setUser(userProfile));
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        dispatch(setError('Failed to fetch user profile. Please try again.'));
        dispatch(setUser(null)); // Log out the user if profile fetch fails
      } finally {
        dispatch(setLoading(false)); // Stop loading after attempt
      }
    } else {
      dispatch(setUser(null));
      dispatch(setLoading(false)); // Stop loading if no user
    }
  });

  return unsubscribe;
};
