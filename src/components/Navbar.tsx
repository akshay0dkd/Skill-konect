import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { logout } from '../redux/features/auth/authSlice';
import { getTasksForUser } from '../services/api';

interface Task {
  id: string;
  status: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.uid) {
      const fetchTasks = async () => {
        const userTasks = await getTasksForUser(user.uid);
        const pendingTasks = userTasks.filter((task: Task) => task.status === 'pending');
        setPendingTasksCount(pendingTasks.length);
      };
      fetchTasks();
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50 dark:bg-gray-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-lg font-bold">Skill Konect</Link>

        {/* Right side container */}
        <div className="flex items-center gap-4">
          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/skills" className="text-gray-300 hover:text-white">Skills</Link>
            <Link to="/requests" className="text-gray-300 hover:text-white">Requests</Link>
            <Link to="/messages" className="text-gray-300 hover:text-white">Messages</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
            <Link to="/tasks" className="text-gray-300 hover:text-white flex items-center gap-2">
              Tasks
              {pendingTasksCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                  {pendingTasksCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-gray-300 hover:text-white">Logout</button>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="text-white focus:outline-none">
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.707.707M4.043 4.043l-.707.707M21 12h-1M4 12H3m15.957-4.957l-.707-.707M6.757 17.243l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>
            )}
          </button>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <Link to="/dashboard" className="block text-gray-300 hover:text-white py-2">Dashboard</Link>
          <Link to="/skills" className="block text-gray-300 hover:text-white py-2">Skills</Link>
          <Link to="/requests" className="block text-gray-300 hover:text-white py-2">Requests</Link>
          <Link to="/messages" className="block text-gray-300 hover:text-white py-2">Messages</Link>
          <Link to="/profile" className="block text-gray-300 hover:text-white py-2">Profile</Link>
          <Link to="/tasks" className="block text-gray-300 hover:text-white py-2">Tasks</Link>
          {isAuthenticated ? (
              <button onClick={handleLogout} className="block text-gray-300 hover:text-white py-2">Logout</button>
            ) : (
              <Link to="/login" className="block text-gray-300 hover:text-white py-2">Login</Link>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
