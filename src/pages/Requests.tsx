import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRequests, updateRequestStatus, getUserProfile } from '../services/api';
import { RootState } from '../redux/store';

interface Request {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  skill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

const Requests: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'received' | 'sent'>('received');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const requestsList = await getRequests(currentUser.uid, view);
      const enhancedRequests = await Promise.all(requestsList.map(async (req: any) => {
          const fromUserProfile: any = await getUserProfile(req.fromUserId).catch(() => ({ displayName: 'Unknown User' }));
          const toUserProfile: any = await getUserProfile(req.toUserId).catch(() => ({ displayName: 'Unknown User' }));
          return {
              ...req,
              fromUserName: fromUserProfile.displayName,
              toUserName: toUserProfile.displayName
          };
      }));
      setRequests(enhancedRequests as Request[]);
    } catch (err: any) {
      console.error(`Error fetching ${view} requests: `, err);
      setError(`Failed to load ${view} requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.uid, view]);

  const handleRequestAction = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    setUpdating(`${requestId}-${newStatus}`);
    try {
      const conversationId = await updateRequestStatus(requestId, newStatus);
      if (newStatus === 'accepted' && conversationId) {
        navigate(`/messages/${conversationId}`);
      } else {
        await fetchRequests(); // Refetch requests to update the list
      }
    } catch (error: any) {
      console.error("Error updating request status: ", error);
      alert(`Failed to update the request: ${error.message}`);
    } finally {
        setUpdating(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Requests...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
          Mentorship Requests
        </h1>
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => setView('received')} 
            className={`px-4 py-2 rounded-l-lg ${view === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
            Incoming
          </button>
          <button 
            onClick={() => setView('sent')} 
            className={`px-4 py-2 rounded-r-lg ${view === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
            Sent
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {requests.length > 0 ? (
            <ul className="space-y-4">
              {requests.map(request => (
                <li key={request.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    {view === 'received' ? `From: ${request.fromUserName}` : `To: ${request.toUserName}`}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">Skill: {request.skill}</p>
                  <p className="text-gray-600 dark:text-gray-300">Message: {request.message}</p>
                  <p className="text-gray-600 dark:text-gray-300">Status: {request.status}</p>
                  {view === 'received' && request.status === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                        <button 
                            onClick={() => handleRequestAction(request.id, 'accepted')} 
                            className="px-3 py-1 bg-green-500 text-white rounded-md disabled:opacity-50"
                            disabled={updating === `${request.id}-accepted`}
                        >
                            {updating === `${request.id}-accepted` ? 'Accepting...' : 'Accept'}
                        </button>
                        <button 
                            onClick={() => handleRequestAction(request.id, 'rejected')} 
                            className="px-3 py-1 bg-red-500 text-white rounded-md disabled:opacity-50"
                            disabled={updating === `${request.id}-rejected`}
                        >
                            {updating === `${request.id}-rejected` ? 'Rejecting...' : 'Reject'}
                        </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">You have no {view} requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
