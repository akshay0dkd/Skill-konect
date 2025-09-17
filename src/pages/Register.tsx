import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebase';
import { login, User } from '../redux/features/auth/authSlice';
import { AppDispatch } from '../redux/store';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skill, setSkill] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create the user document for Firestore
      const userDoc = {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: serverTimestamp(),
        skill,
        bio,
      };

      // 3. Save user document to Firestore
      await setDoc(doc(db, "users", user.uid), userDoc);

      // 4. Create user object for Redux store (matching existing User interface)
      const reduxUser: User = {
        uid: user.uid,
        name: name, // Maps to 'name' in Redux state
        email: user.email ?? '',
        profilePicture: userDoc.photoURL, // Maps to 'profilePicture' in Redux state
        skill,
        bio,
        rating: 0, // Default rating for new users
      };
      
      // 5. Dispatch login action and navigate
      dispatch(login(reduxUser));
      navigate('/dashboard');
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Join our community of skilled professionals.</p>
        </div>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="name" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Full Name
            </label>
          </div>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="email" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Email Address
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="password" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="skill"
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            />
            <label 
              htmlFor="skill" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Skill
            </label>
          </div>
          <div className="relative">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              placeholder=" "
            ></textarea>
            <label 
              htmlFor="bio" 
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Bio
            </label>
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:scale-105 active:scale-95 shadow-lg transition-transform">
            Create Account
          </button>
        </form>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Already have an account? <Link to="/login" className="font-medium text-indigo-500 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
