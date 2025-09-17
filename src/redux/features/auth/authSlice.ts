import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser, getUserProfile, updateUserProfile as apiUpdateUserProfile } from '../../../services/api';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { RootState } from '../store';

// Define a type for the user object that matches our Firestore data
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  availability?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true
  error: null,
};

export const login = createAsyncThunk<User, { email: string; password: string }>
(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const firebaseUser = await loginUser(email, password);
      const userProfile = await getUserProfile(firebaseUser.uid);
      return userProfile as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk<User, { email: string; password: string; displayName: string }>
(
  'auth/register',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const firebaseUser = await registerUser(email, password, displayName);
      const userProfile = await getUserProfile(firebaseUser.uid);
      return userProfile as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: any, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      if (!auth.user) {
        throw new Error('No user logged in');
      }
      
      await apiUpdateUserProfile(auth.user.uid, updates);
      
      // Return the updated user data
      return updates;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLoading, setUser, setError } = authSlice.actions;
export default authSlice.reducer;