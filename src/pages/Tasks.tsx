import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getTasksForUser, updateTaskStatus, sendMessage } from '../services/api';

interface Task {
  id: string;
  assignedBy: string;
  assignedTo: string;
  taskName: string;
  taskDescription: string;
  status: string;
  createdAt: any;
  conversationId: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchTasks();
    }
  }, [currentUser]);

  const fetchTasks = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const userTasks = await getTasksForUser(currentUser.uid);
      setTasks(userTasks as Task[]);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: string, completed: boolean) => {
    if (!currentUser?.uid) return;
    try {
      await updateTaskStatus(task.id, newStatus, completed);
      if (newStatus === 'completed') {
        await sendMessage(task.conversationId, currentUser.uid, `(${task.taskName}) task completed`);
      } else {
        await sendMessage(task.conversationId, currentUser.uid, `(${task.taskName}) task marked as incomplete`);
      }
      // Refresh the tasks list to show the updated status
      fetchTasks(); 
    } catch (error) {
      console.error('Error updating task status:', error);
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center dark:bg-gray-900 dark:text-white">Loading tasks...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center text-red-500 dark:bg-gray-900">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-text-primary dark:text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">My Tasks</h1>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-lg font-semibold dark:text-white">{task.taskName}</p>
                <p className="text-sm text-text-secondary dark:text-gray-400">{task.taskDescription}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${task.completed ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'}`}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                  <span className="text-xs text-text-secondary dark:text-gray-400">
                    {new Date(task.createdAt?.toDate()).toLocaleDateString()}
                  </span>
                </div>
                {task.status === 'pending' ? (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task, 'completed', true)}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    Mark as Complete
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task, 'pending', false)}
                    className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                  >
                    Mark as Incomplete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-secondary dark:text-gray-400">You have no tasks assigned to you.</p>
        )}
      </div>
    </div>
  );
};

export default Tasks;
