import React, { useState, useEffect } from 'react';
import { getAllUsers, startConversation } from '../services/api';

interface User {
  id: string;
  displayName: string;
  photoURL: string;
}

// This is a subset of the Conversation interface in Messages.tsx
interface ConversationInfo {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageTimestamp: any;
    otherUserName: string;
    otherUserAvatar: string;
}

interface Props {
  isOpen: boolean;
  onClose: (newConversation?: ConversationInfo) => void;
  currentUser: any;
}

const NewChatModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStartingChat(false);
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const allUsers = await getAllUsers(currentUser.uid);
          setUsers(allUsers as User[]);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, currentUser.uid]);

  const handleUserSelect = async (user: User) => {
    if (startingChat) return;
    setStartingChat(true);
    try {
      const conversationId = await startConversation(currentUser.uid, user.id);
      const newConvo: ConversationInfo = {
          id: conversationId,
          participants: [currentUser.uid, user.id],
          otherUserName: user.displayName,
          otherUserAvatar: user.photoURL,
          lastMessage: '',
          lastMessageTimestamp: null,
      };
      onClose(newConvo);
    } catch (error) {
      console.error("Error starting conversation:", error);
      onClose(); 
    } 
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-text-primary dark:text-white">Start a New Chat</h2>
        <input
          type="text"
          placeholder="Search for users..."
          className="w-full border rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          disabled={startingChat}
        />
        <div className="overflow-y-auto max-h-60">
          {loadingUsers ? (
            <p className="text-center text-gray-400">Loading users...</p>
          ) : startingChat ? (
            <p className="text-center text-gray-400">Starting chat...</p>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-lg ${startingChat ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => handleUserSelect(user)}
              >
                <img src={user.photoURL || 'https://via.placeholder.com/150'} alt={user.displayName} className="w-10 h-10 rounded-full mr-4" />
                <p className="font-semibold text-text-primary dark:text-white">{user.displayName}</p>
              </div>
            ))
          )}
        </div>
        <button onClick={() => onClose()} disabled={startingChat} className="mt-6 text-sm text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NewChatModal;
