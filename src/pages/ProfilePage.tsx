import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getUserProfile, addReview } from '../services/api';
import AddReviewModal from '../components/AddReviewModal';

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
    rating: number;
    ratingCount: number;
}

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isSubmittingReview, setSubmittingReview] = useState(false);

    const fetchProfile = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const userProfile = await getUserProfile(userId);
            setProfile(userProfile as UserProfile);
        } catch (err) {
            setError('Failed to load user profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const handleAddReview = async (rating: number, comment: string) => {
        if (!currentUser || !userId || currentUser.uid === userId) {
            alert("You cannot review yourself.");
            return;
        }

        setSubmittingReview(true);
        try {
            await addReview(currentUser.uid, userId, rating, comment);
            setReviewModalOpen(false);
            fetchProfile(); // Re-fetch profile to show updated rating
        } catch (error) {
            console.error("Error submitting review: ", error);
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading profile...</div>;
    }

    if (error || !profile) {
        return <div className="flex h-full items-center justify-center text-red-500">{error || 'Profile not found.'}</div>;
    }

    const rating = profile.rating || 0;
    const ratingCount = profile.ratingCount || 0;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-text-primary dark:text-white p-8">
            <div className="container mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="flex flex-col items-center md:flex-row md:items-start">
                        <img src={profile.photoURL || 'https://via.placeholder.com/150'} alt={profile.displayName} className="w-48 h-48 rounded-full mb-6 md:mb-0 md:mr-8" />
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold mb-2">{profile.displayName}</h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{profile.title}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                ))}
                                <span className="ml-2 text-gray-600 dark:text-gray-300 font-semibold">{rating.toFixed(1)} ({ratingCount} reviews)</span>
                            </div>
                            <p className="text-md text-gray-500 dark:text-gray-300 my-4">{profile.location}</p>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${profile.availability === 'Available' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {profile.availability}
                            </span>
                            {currentUser && userId !== currentUser.uid && (
                                <button 
                                    onClick={() => setReviewModalOpen(true)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Add Review
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">About Me</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    </div>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <span key={skill} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-md text-gray-800 dark:text-gray-300">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <AddReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setReviewModalOpen(false)} 
                onSubmit={handleAddReview} 
                isSubmitting={isSubmittingReview} 
            />
        </div>
    );
};

export default ProfilePage;
