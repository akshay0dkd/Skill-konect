import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getConnections, getTasksForUser, getRequests, getConversations } from '../services/api';
import { User } from '../models/user';
import { Task } from '../models/task';
import { Request } from '../models/request';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [connections, setConnections] = useState<User[]>([]);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [userConnections, userTasks, receivedRequests, conversations] = await Promise.all([
        getConnections(user.uid),
        getTasksForUser(user.uid),
        getRequests(user.uid, 'received'),
        getConversations(user.uid)
      ]);

      setConnections(userConnections as User[]);

      const pendingTasks = userTasks.filter((task: Task) => task.status === 'pending');
      setPendingTasksCount(pendingTasks.length);

      const pendingRequests = receivedRequests.filter((request: Request) => request.status === 'pending');
      setPendingRequestsCount(pendingRequests.length);

      const unreadConversations = conversations.filter(c => c.lastMessage && !c.lastMessage.read && c.lastMessage.senderId !== user.uid);
      setUnreadMessagesCount(unreadConversations.length);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Handle error state in UI
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Connections</h2>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{connections.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Pending Tasks</h2>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{pendingTasksCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Pending Requests</h2>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{pendingRequestsCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Unread Messages</h2>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{unreadMessagesCount}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Connections</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            {connections.slice(0, 5).map(connection => (
              <div key={connection.uid} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center">
                  <img src={connection.photoURL || '/default-avatar.png'} alt={connection.displayName} className="h-10 w-10 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{connection.displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{connection.email}</p>
                  </div>
                </div>
              </div>
            ))}
            {connections.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No connections yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
