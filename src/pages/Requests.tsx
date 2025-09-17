import React, { useState, useEffect, useMemo } from 'react';
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
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'received' | 'sent'>('received');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const [sent, received] = await Promise.all([
        getRequests(currentUser.uid, 'sent'),
        getRequests(currentUser.uid, 'received'),
      ]);

      const enhanceRequests = async (requests: any[]) => {
        const userIds = new Set<string>();
        requests.forEach(req => {
          userIds.add(req.fromUserId);
          userIds.add(req.toUserId);
        });

        const userProfiles = await Promise.all(
          Array.from(userIds).map(uid => getUserProfile(uid).catch(() => ({ uid, displayName: 'Unknown User' })))
        );

        const profilesMap = new Map(userProfiles.map((p: any) => [p.uid, p.displayName]));

        return requests.map(req => ({
          ...req,
          fromUserName: profilesMap.get(req.fromUserId) || 'Unknown User',
          toUserName: profilesMap.get(req.toUserId) || 'Unknown User',
        }));
      };

      const [enhancedSent, enhancedReceived] = await Promise.all([
        enhanceRequests(sent),
        enhanceRequests(received),
      ]);

      setSentRequests(enhancedSent as Request[]);
      setReceivedRequests(enhancedReceived as Request[]);

    } catch (err: any) {
      console.error(`Error fetching requests: `, err);
      setError(`Failed to load requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchRequests();
    }
  }, [currentUser?.uid]);

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

  const requests = useMemo(() => (view === 'sent' ? sentRequests : receivedRequests), [view, sentRequests, receivedRequests]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
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
