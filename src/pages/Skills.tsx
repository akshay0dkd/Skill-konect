import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getUsersBySkill, getSkills, sendMentorshipRequest } from '../services/api';
import { User } from 'firebase/auth';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  title: string;
  bio: string;
  skills: string[];
  location: string;
  availability: string;
}

interface Skill {
  id: string;
  name: string;
}

const Skills: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [requestStatus, setRequestStatus] = useState<{[key: string]: string}>({});
  const [skillSelectionUser, setSkillSelectionUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchSkills();
    fetchUsers();
  }, []);

  const fetchSkills = async () => {
    try {
      const skillsList = await getSkills();
      setSkills(skillsList as Skill[]);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchUsers = async (skill: string = '') => {
    setLoading(true);
    try {
      const userList = await getUsersBySkill(skill);
      const filteredUsers = userList.filter(u => u.uid !== currentUser?.uid);
      setUsers(filteredUsers as UserProfile[]);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const skill = event.target.value;
    setSelectedSkill(skill);
    fetchUsers(skill);
  };

  const handleSendRequest = async (toUserId: string, skill: string) => {
    if (!currentUser) return;
    try {
      await sendMentorshipRequest(currentUser.uid, toUserId, skill, `Hi! I would like to learn ${skill} from you.`);
      setRequestStatus(prev => ({...prev, [`${toUserId}-${skill}`]: 'Request Sent'}));
      setSkillSelectionUser(null);
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      setRequestStatus(prev => ({...prev, [`${toUserId}-${skill}`]: 'Failed to Send'}));
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Find a Mentor</h1>
          <select 
            onChange={handleSkillChange} 
            value={selectedSkill} 
            className="w-full sm:w-64 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Skills</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.name}>{skill.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {users.map(user => (
            <div key={user.uid} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between">
              <div>
                <img src={user.photoURL || 'https://via.placeholder.com/150'} alt={user.displayName} className="w-32 h-32 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">{user.displayName}</h2>
                <p className="text-center text-gray-600 dark:text-gray-400">{user.title}</p>
                <div className="mt-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Skills:</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {user.skills.map(skill => (
                            <span key={skill} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-800 dark:text-gray-300">{skill}</span>
                        ))}
                    </div>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => setSkillSelectionUser(user)}
                  className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Connect Me
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {skillSelectionUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg mx-4 sm:mx-0">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Select a skill to learn from {skillSelectionUser.displayName}</h2>
            <div className="flex flex-col gap-3">
              {skillSelectionUser.skills.map((skill: string) => (
                <button 
                  key={skill}
                  onClick={() => handleSendRequest(skillSelectionUser.uid, skill)}
                  disabled={requestStatus[`${skillSelectionUser.uid}-${skill}`] === 'Request Sent'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                >
                  {requestStatus[`${skillSelectionUser.uid}-${skill}`] || `Request to learn ${skill}`}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setSkillSelectionUser(null)} 
              className="mt-6 w-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-md transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
