import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../redux/store';
import { getRequests, getTasksForUser, getConversations, getUsersBySkill } from '../services/api';
import { ROUTES } from '../constants/routes';

interface Request {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Task {
  id: string;
  completed: boolean;
}

interface Mentor {
  uid: string;
  displayName: string;
  photoURL: string;
  title: string;
  skills: string[];
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    pendingTasks: 0,
    conversations: 0,
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [requests, tasks, conversations, users] = await Promise.all([
          getRequests(user.uid, 'received'),
          getTasksForUser(user.uid),
          getConversations(user.uid),
          getUsersBySkill(''),
        ]);

        setStats({
          pendingRequests: requests.filter((req: Request) => req.status === 'pending').length,
          pendingTasks: tasks.filter((task: Task) => !task.completed).length,
          conversations: conversations.length,
        });

        const suggestedMentors = users.filter((u: Mentor) => u.uid !== user.uid).slice(0, 3); // Show 3 mentors
        setMentors(suggestedMentors);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  const StatCard = ({ title, value, linkTo, icon }: { title: string, value: number, linkTo: string, icon: string }) => (
    <Link to={linkTo} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </Link>
  );

  const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <Link to={`${ROUTES.PROFILE}/${mentor.uid}`} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col text-center items-center">
      <img src={mentor.photoURL || 'https://via.placeholder.com/150'} alt={mentor.displayName} className="w-24 h-24 rounded-full mb-4" />
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{mentor.displayName}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{mentor.title}</p>
    </Link>
  );

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.displayName || 'User'}!</h1>
          <p className="text-gray-600 dark:text-gray-300">Here's a summary of your activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Pending Requests" value={stats.pendingRequests} linkTo={ROUTES.REQUESTS} icon="📨" />
          <StatCard title="Active Tasks" value={stats.pendingTasks} linkTo={ROUTES.TASKS} icon="📝" />
          <StatCard title="Conversations" value={stats.conversations} linkTo={ROUTES.CHAT} icon="💬" />
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Suggested Mentors</h2>
            <Link to={ROUTES.SKILLS} className="text-indigo-500 hover:underline">View All</Link>
          </div>
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map(m => <MentorCard key={m.uid} mentor={m} />)}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500 dark:text-gray-400">No mentors to suggest right now.</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to={`${ROUTES.PROFILE}/${user?.uid}`} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">View Your Profile</Link>
            <Link to={ROUTES.REQUESTS} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Manage Requests</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
