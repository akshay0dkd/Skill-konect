import React from "react";
import { useNavigate } from "react-router-dom"; // Add this import

const Login: React.FC = () => {
  const navigate = useNavigate(); // Add this hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle authentication
    // For now, we'll just redirect to home
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/'); // Add this function
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-900 via-indigo-900 to-purple-900 animate-gradient">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-96 text-center border border-white/20">
        
        {/* Logo - Make it clickable to go home */}
        <div className="flex flex-col items-center mb-6 cursor-pointer" onClick={handleHomeClick}>
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full p-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-bold text-2xl mt-2 text-white drop-shadow-md">Skill Konect</h1>
        </div>

        {/* Form - Add onSubmit handler */}
        <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
          <div className="relative">
            <label className="text-sm font-medium text-gray-200">Username or Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              className="mt-1 w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-gray-300 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute left-3 top-9 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 01-8 0 4 4 0 018 0zm8 0a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
            </span>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-gray-300 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute left-3 top-9 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zM12 19a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </span>
          </div>

          <button
            type="submit"
            className="mt-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white font-semibold hover:scale-105 active:scale-95 shadow-md transition-all"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-200">
          Don't have an account?{" "}
          <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
        
        {/* Add a back to home link */}
        <p className="mt-4 text-sm text-gray-200">
          <span 
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
            onClick={handleHomeClick}
          >
            Back to Home
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;