import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { logout } from '../redux/features/auth/authSlice';
import { getTasksForUser } from '../services/api';
import { ROUTES } from '../constants/routes';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      getTasksForUser(user.uid).then(tasks => {
        const pending = tasks.filter(task => task.status === 'pending');
        setPendingTasksCount(pending.length);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const authenticatedNav = (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-6">
        <Link to={ROUTES.DASHBOARD} className="text-gray-300 hover:text-white">Dashboard</Link>
        <Link to={ROUTES.REQUESTS} className="text-gray-300 hover:text-white">Requests</Link>
        <Link to={ROUTES.CHAT} className="text-gray-300 hover:text-white">Messages</Link>
        <Link to={ROUTES.TASKS} className="text-gray-300 hover:text-white flex items-center">
          Tasks
          {pendingTasksCount > 0 && 
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{pendingTasksCount}</span>
          }
        </Link>
      </div>

      <button onClick={toggleTheme} className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="relative" ref={profileMenuRef}>
        <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center text-sm rounded-full focus:outline-none">
          <img className="h-8 w-8 rounded-full" src={user?.photoURL || 'https://via.placeholder.com/150'} alt="User avatar" />
        </button>

        {isProfileMenuOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
            <Link to={`${ROUTES.PROFILE}/${user?.uid}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Your Profile</Link>
            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sign out</button>
          </div>
        )}
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
          </svg>
        </button>
      </div>
    </div>
  );

  const unauthenticatedNav = (
    <div className="flex items-center space-x-4">
      <Link to={ROUTES.LOGIN} className="text-gray-300 hover:text-white">Login</Link>
      <Link to={ROUTES.REGISTER} className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600">Register</Link>
      <button onClick={toggleTheme} className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );

  const mobileMenu = (
    <div className="md:hidden absolute top-16 left-0 w-full bg-gray-800 dark:bg-gray-900 z-50">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link to={ROUTES.DASHBOARD} onClick={closeMobileMenu} className="block text-gray-300 hover:text-white px-3 py-2 rounded-md">Dashboard</Link>
        <Link to={ROUTES.REQUESTS} onClick={closeMobileMenu} className="block text-gray-300 hover:text-white px-3 py-2 rounded-md">Requests</Link>
        <Link to={ROUTES.CHAT} onClick={closeMobileMenu} className="block text-gray-300 hover:text-white px-3 py-2 rounded-md">Messages</Link>
        <Link to={ROUTES.TASKS} onClick={closeMobileMenu} className="block text-gray-300 hover:text-white px-3 py-2 rounded-md">Tasks</Link>
      </div>
    </div>
  );

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTES.ROOT} className="text-white text-xl font-bold">Skill Konect</Link>
          </div>
          {!loading && (isAuthenticated ? authenticatedNav : unauthenticatedNav)}
        </div>
      </div>
      {isMobileMenuOpen && isAuthenticated && mobileMenu}
    </nav>
  );
};

export default Navbar;
