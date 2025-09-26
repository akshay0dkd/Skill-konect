import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { login, setError } from '../redux/features/auth/authSlice';
import { AppDispatch, RootState } from '../redux/store';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(false);

    try {
      await dispatch(login({ email, password })).unwrap();
      // The navigation will be handled by the useEffect hook
    } catch (err: any) {
      // The error is already set by the rejected thunk
      console.error('Failed to login:', err);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      dispatch(setError('Please enter your email address to reset your password.'));
      return;
    }
    dispatch(setError(null));
    setResetSent(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome Back!</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to continue your journey.</p>
        </div>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>}
        {resetSent && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">A password reset link has been sent to your email.</div>}
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <label className='text-white'> Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="email" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >

            </label>
          </div>
          <div className="relative">
                <label className='text-white'>Password</label> 
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="password" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
         
            </label>
          </div>
          <div className="text-right">
            <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-indigo-500 hover:underline">
              Forgot Password?
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:scale-105 active:scale-95 shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Don't have an account? <Link to="/register" className="font-medium text-indigo-500 hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
