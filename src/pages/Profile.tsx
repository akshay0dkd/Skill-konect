import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { updateProfile } from '../redux/features/auth/authSlice';

const Profile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setBio(user.bio || '');
      setSkills(Array.isArray(user.skills) ? user.skills : (user.skills ? [user.skills] : []));
    }
  }, [user]);

  const handleAddSkill = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(updateProfile({ displayName: name, bio, skills }));
    }
  };

  if (!user) {
    return <div className="text-center p-8">Please login to view your profile.</div>;
  }

  const rating = user.rating || 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
          <img 
            src={user.photoURL || 'https://via.placeholder.com/150'} 
            alt="Profile" 
            className="w-32 h-32 rounded-full ring-4 ring-indigo-500 object-cover shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{user.displayName}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
              <span className="ml-2 text-gray-600 dark:text-gray-300 font-semibold">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Me</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{user.bio || 'No bio available.'}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map(s => (
                <span key={s} className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No skills listed.</p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Update Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
            <label className="text-gray-900 dark:text-white">Full Name</label>
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  placeholder=" "
                />
                 
               
                <label 
                  htmlFor="name" 
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                </label>
            </div>
            <div className="relative">
            <label className="text-gray-900 dark:text-white  "> About Me</label>
              <textarea 
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 h-32"
                placeholder=" "
              />
              
              <label 
                  htmlFor="bio" 
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                >
                </label>
            </div>
            
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Manage Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map(s => (
                        <span key={s} className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-red-500 hover:text-red-700 font-bold">x</button>
                        </span>
                    ))}
                </div>
                <div className="relative">
                <input 
                    id="skill-input"
                    type="text" 
                    value={currentSkill}
                    onChange={e => setCurrentSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill(e)}
                    className="peer w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    placeholder=" "
                />
                <label 
                    htmlFor="skill-input" 
                    className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-indigo-500"
                    >
                    Add a skill
                </label>
                <button type="button" onClick={handleAddSkill} className="absolute right-2 top-2 px-4 py-1 rounded-lg bg-indigo-500 text-white font-semibold">Add</button>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:scale-105 active:scale-95 shadow-lg transition-transform disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
