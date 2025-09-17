import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTasks, getUserProfile, updateTaskStatus, sendMessage } from '../services/api';
import { RootState } from '../redux/store';

interface Task {
  id: string;
  assignedBy: string;
  task: string;
  createdAt: any;
  status: string;
  conversationId: string;
  assignedByName?: string; // Optional: To store the display name of the assigner
}

const Tasks: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    fetchTasks();
  }, [currentUser?.uid]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let fetchedTasks = await getTasks(currentUser.uid);

      const tasksWithAssignerNames = await Promise.all(
        fetchedTasks.map(async (task) => {
          try {
            const assignerProfile: any = await getUserProfile(task.assignedBy);
            return { ...task, assignedByName: assignerProfile.displayName };
          } catch (error) {
            console.error('Error fetching assigner profile:', error);
            return { ...task, assignedByName: 'Unknown User' }; // Fallback name
          }
        })
      );

      setTasks(tasksWithAssignerNames as Task[]);
    } catch (err) {
      console.error("Error fetching tasks: ", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: string) => {
    if (!currentUser?.uid) return;
    try {
      await updateTaskStatus(task.id, newStatus);
      if (newStatus === 'completed') {
        await sendMessage(task.conversationId, currentUser.uid, `I have completed the task: "${task.task}"`);
      }
      // Refresh the tasks list to show the updated status
      fetchTasks(); 
    } catch (error) {
      console.error('Error updating task status:', error);
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-text-primary dark:text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">My Tasks</h1>
        
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-lg font-semibold mb-2">{task.task}</p>
                <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">
                  Assigned by: {task.assignedByName}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {task.status}
                  </span>
                  <span className="text-xs text-text-secondary dark:text-gray-400">
                    {new Date(task.createdAt?.toDate()).toLocaleDateString()}
                  </span>
                </div>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateTaskStatus(task, 'completed')}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                  >
                    Mark as Complete
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
