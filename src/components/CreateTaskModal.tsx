import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskName: string, taskDescription: string) => void;
}

const CreateTaskModal: React.FC<Props> = ({ isOpen, onClose, onCreateTask }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleSubmit = () => {
    if (taskName.trim()) {
      onCreateTask(taskName, taskDescription);
      setTaskName('');
      setTaskDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-text-primary dark:text-white">Create a New Task</h2>
        <input
          type="text"
          placeholder="Task Name"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
        />
        <textarea
          placeholder="Task Description"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={taskDescription}
          onChange={e => setTaskDescription(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-400 hover:underline mr-4">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
