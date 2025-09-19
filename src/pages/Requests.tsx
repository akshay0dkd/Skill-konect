import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRequests, updateRequestStatus, getUserProfile } from '../services/api';
import { RootState } from '../redux/store';
import { ROUTES } from '../constants/routes';

// Request interface reflecting Firestore data structure
interface Request {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  skill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: { seconds: number; nanoseconds: number; };
}

const RequestsPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // State management
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Tracks the ID of the request being updated

  // Fetches and processes requests from Firestore
  const fetchAllRequests = useCallback(async () => {
    if (!currentUser?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const [sent, received] = await Promise.all([
        getRequests(currentUser.uid, 'sent'),
        getRequests(currentUser.uid, 'received'),
      ]);

      // Fetches user profiles to get display names
      const enhanceWithUserNames = async (requests: Omit<Request, 'fromUserName' | 'toUserName'>[]): Promise<Request[]> => {
        const userIds = new Set<string>();
        requests.forEach(req => {
          userIds.add(req.fromUserId);
          userIds.add(req.toUserId);
        });

        const profiles = await Promise.all(
          Array.from(userIds).map(id => getUserProfile(id).catch(() => null))
        );
        
        const profileMap = new Map(profiles.filter(p => p).map(p => [p?.uid, p?.displayName || 'Unknown User']));

        return requests.map(req => ({
          ...req,
          fromUserName: profileMap.get(req.fromUserId),
          toUserName: profileMap.get(req.toUserId),
        })) as Request[];
      };

      const [enhancedSent, enhancedReceived] = await Promise.all([
          enhanceWithUserNames(sent),
          enhanceWithUserNames(received),
      ]);

      // Sort requests by creation date
      setSentRequests(enhancedSent.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
      setReceivedRequests(enhancedReceived.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));

    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("An error occurred while fetching requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Initial fetch of requests on component mount
  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  // Handles accepting or rejecting a mentorship request
  const handleAction = async (requestId: string, status: 'accepted' | 'rejected', menteeId: string) => {
    setIsUpdating(requestId);
    setError(null); // Clear previous errors
    try {
      const conversationId = await updateRequestStatus(requestId, status, menteeId);
      
      // If accepted, navigate to chat
      if (status === 'accepted' && conversationId) {
        navigate(ROUTES.MESSAGES);
      } else {
        // If rejected, or for some reason accept didn't return a conversationId, refresh data
        await fetchAllRequests();
      }
    } catch (err: any) {
      console.error(`Failed to ${status} request:`, err);
      // Provide a more specific error message if available
      const specificMessage = err.message ? `: ${err.message}` : '. Please try again.';
      setError(`Failed to ${status} the request${specificMessage}`);
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Determines which requests to display based on the active tab
  const displayedRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  // Renders a single request card
  const renderRequestCard = (request: Request) => (
    <li key={request.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-2 transition-transform hover:scale-105">
        <div className="flex justify-between items-start">
            <span className="font-semibold text-lg">{activeTab === 'received' ? `${request.fromUserName}` : `${request.toUserName}`}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}
            </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Skill:</span> {request.skill}</p>
        {request.message && <p className="text-gray-700 dark:text-gray-300 italic">\"{request.message}\"</p>}
        <div className="flex items-center justify-between pt-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-full 
                ${request.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                  request.status === 'accepted' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            {/* Action buttons for pending received requests */}
            {activeTab === 'received' && request.status === 'pending' && (
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => handleAction(request.id, 'accepted', request.fromUserId)} 
                        disabled={!!isUpdating}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors">
                        {isUpdating === request.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button 
                        onClick={() => handleAction(request.id, 'rejected', request.fromUserId)} 
                        disabled={!!isUpdating}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors">
                        {isUpdating === request.id ? 'Rejecting...' : 'Reject'}
                    </button>
                </div>
            )}
        </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600 dark:text-indigo-400">Mentorship Requests</h1>
        
        <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-6">
          <button onClick={() => setActiveTab('received')} className={`px-6 py-2 font-semibold ${activeTab === 'received' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Incoming
          </button>
          <button onClick={() => setActiveTab('sent')} className={`px-6 py-2 font-semibold ${activeTab === 'sent' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Sent
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading requests...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : displayedRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">No {activeTab} requests found.</div>
        ) : (
          <ul className="space-y-4">
            {displayedRequests.map(renderRequestCard)}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
