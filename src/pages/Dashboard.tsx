import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../redux/store';
import { getConnections } from '../services/api';
import { User } from '../redux/features/auth/authSlice';

const Dashboard: React.FC = () => {
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [connections, setConnections] = useState<User[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchConnections = async () => {
        try {
          const userConnections = await getConnections(user.uid);
          setConnections(userConnections as User[]);
        } catch (error) {
          console.error("Failed to fetch connections: ", error);
        } finally {
          setConnectionsLoading(false);
        }
      };

      fetchConnections();
    }
  }, [user]);

  if (loading || connectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">Error loading dashboard. Please try again.</div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* User Info Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center gap-6">
          <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full border-4 border-indigo-500" />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.bio || 'No bio available'}</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 items-center">
              <span className="font-semibold">Skills:</span>
              {user.skills && Array.isArray(user.skills) ? (
                user.skills.map((s, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                    {s}
                  </span>
                ))
              ) : user.skills ? (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                  {user.skills}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/skills" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Find Skills
              </Link>
              <Link to="/requests" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Requests
              </Link>
              <Link to="/messages" className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Messages
              </Link>
            </div>

            {/* Connections List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">My Connections</h2>
              <div className="flex flex-col gap-4">
                {connections.length > 0 ? connections.map(c => (
                  <div key={c.uid} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <img src={c.photoURL || 'https://via.placeholder.com/40'} alt={c.displayName} className="w-10 h-10 rounded-full mr-4" />
                    <div className="flex-1">
                      <p className="font-semibold">{c.displayName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{c.title || 'No title available'}</p>
                    </div>
                  </div>
                )) : (
                    <p className="text-gray-500 dark:text-gray-400">No connections yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="flex flex-col gap-8">
            {/* Activity Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">Activity Summary</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Connections:</span>
                  <span className="text-blue-500 font-bold">{connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Skills Listed:</span>
                  <span className="text-purple-500 font-bold">{Array.isArray(user.skills) ? user.skills.length : (user.skills ? 1 : 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
