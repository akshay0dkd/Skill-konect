import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getUserProfile, sendMentorshipRequest, startConversation, rateUser } from '../services/api';
import { ROUTES } from '../constants/routes';
import Rating from '../components/Rating';

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
    averageRating?: number;
    ratingCount?: number;
}

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        if (currentUser?.uid && userId) {
            setIsOwnProfile(currentUser.uid === userId);
        }
    }, [currentUser, userId]);

    const fetchProfile = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const userProfile = await getUserProfile(userId);
            if (userProfile) {
                setProfile(userProfile as UserProfile);
            } else {
                setError('User profile not found.');
            }
        } catch (err) {
            setError('Failed to load user profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const handleConnectClick = () => {
        setIsModalOpen(true);
    };

    const handleMessageClick = async () => {
        if (!currentUser || !userId) return;
        try {
            const conversationId = await startConversation(currentUser.uid, userId);
            navigate(ROUTES.MESSAGES);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            alert('Failed to start a conversation.');
        }
    };

    const handleSkillSelect = async (skill: string) => {
        if (!currentUser || !userId) return;
        setRequestStatus('sending');
        try {
            await sendMentorshipRequest(currentUser.uid, userId, skill, `Hi, I'd like to learn ${skill} from you.`);
            setRequestStatus('sent');
            setTimeout(() => {
                setIsModalOpen(false);
                setRequestStatus('idle');
            }, 2000); // Close modal after 2 seconds
        } catch (error) {
            console.error("Failed to send request:", error);
            setRequestStatus('idle');
            alert('Failed to send mentorship request.');
        }
    };

    const handleRatingChange = (newRating: number) => {
        setUserRating(newRating);
    };

    const handleRateUser = async () => {
        if (!currentUser || !userId || userRating === 0) return;
        try {
            await rateUser(userId, currentUser.uid, userRating);
            alert('Rating submitted successfully!');
            // Refresh profile to show new average rating
            fetchProfile();
        } catch (error) {
            console.error("Failed to submit rating:", error);
            alert('Failed to submit rating.');
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading profile...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    }

    if (!profile) {
        return <div className="flex h-screen items-center justify-center">Profile not available.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start">
                        <img src={profile.photoURL || 'https://via.placeholder.com/150'} alt={profile.displayName} className="w-32 h-32 rounded-full mb-4 sm:mb-0 sm:mr-8" />
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold mb-1">{profile.displayName}</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{profile.title}</p>
                            <div className="flex items-center justify-center sm:justify-start mb-2">
                                <Rating initialRating={profile.averageRating || 0} readOnly />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">({profile.ratingCount || 0} ratings)</span>
                            </div>
                            <p className="text-md text-gray-500 dark:text-gray-300 mb-4">{profile.location}</p>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${profile.availability === 'Available' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {profile.availability}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center sm:text-right">
                        {isOwnProfile ? (
                            <Link to={ROUTES.EDIT_PROFILE} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">
                                Edit Profile
                            </Link>
                        ) : (
                            <>
                                <button onClick={handleConnectClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                                    Connect Me
                                </button>
                                <button onClick={handleMessageClick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg ml-4">
                                    Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">About Me</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.length > 0 ? profile.skills.map(skill => (
                                <span key={skill} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-md text-gray-800 dark:text-gray-300">{skill}</span>
                            )) : <p>No skills listed.</p>}
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Rate {profile.displayName}</h2>
                            <Rating onRatingChange={handleRatingChange} />
                            <button 
                                onClick={handleRateUser}
                                disabled={userRating === 0}
                                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
                            >
                                Submit Rating
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                        {requestStatus === 'sent' ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-4">Request Sent!</h2>
                                <p>Your mentorship request has been sent to {profile.displayName}.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Choose a skill to learn</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map(skill => (
                                        <button 
                                            key={skill} 
                                            onClick={() => handleSkillSelect(skill)}
                                            disabled={requestStatus === 'sending'}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="mt-6 text-sm text-gray-600 dark:text-gray-400 hover:underline">Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
