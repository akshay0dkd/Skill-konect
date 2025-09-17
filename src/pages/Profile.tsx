import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { updateProfile } from '../redux/features/auth/authSlice';
import { uploadFile } from '../services/storage';
import { updateUserPhotoURL } from '../services/api';

const Profile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      setUploading(true);
      setUploadStatus('Uploading...');
      try {
        const photoURL = await uploadFile(file, `profile_pictures/${user.uid}`);
        await updateUserPhotoURL(user.uid, photoURL);
        dispatch(updateProfile({ photoURL }));
        setUploadStatus('Profile picture updated successfully!');
      } catch (error) {
        console.error("Error uploading photo:", error);
        setUploadStatus('Failed to upload profile picture.');
      } finally {
        setUploading(false);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    }
  };

  if (!user) {
    return <div className="text-center p-8">Please login to view your profile.</div>;
  }

  const rating = user.rating || 0;
  const ratingCount = user.ratingCount || 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {uploadStatus && (
          <div className={`p-4 mb-4 text-sm text-center rounded-lg ${uploadStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {uploadStatus}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="relative">
                <img 
                    src={user.photoURL || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full ring-4 ring-indigo-500 object-cover shadow-lg"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
                    disabled={uploading}
                >
                    {uploading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>

          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{user.displayName}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
              <span className="ml-2 text-gray-600 dark:text-gray-300 font-semibold">{rating.toFixed(1)} ({ratingCount} reviews)</span>
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
