import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Vote, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

interface VotingRecord {
  _id: string;
  election: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  timestamp: string;
}

const VotingHistory: React.FC = () => {
  const [history, setHistory] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchVotingHistory = async () => {
      try {
        const response = await api.get('/voters/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching voting history:', error);
        toast.error('Failed to load voting history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotingHistory();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/voter"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Your Voting History</h1>
          <p className="text-gray-600 mt-1">
            A record of all elections you have participated in
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((record) => {
                const isCompleted = new Date(record.election.endDate) < new Date();
                
                return (
                  <div 
                    key={record._id} 
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-medium text-gray-900">{record.election.title}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Voted on {formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Vote className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 font-medium mr-4">Vote Recorded</span>
                        
                        {isCompleted && (
                          <Link 
                            to={`/election/results/${record.election._id}`}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Results
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">You haven't voted in any elections yet.</p>
              <Link 
                to="/voter" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Active Elections
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingHistory;