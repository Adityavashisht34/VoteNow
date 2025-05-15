import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Vote, Clock, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

interface Candidate {
  _id: string;
  name: string;
  description: string;
  photoUrl?: string;
}

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Candidate[];
}

const VotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch election details
        const electionResponse = await api.get(`/elections/${id}`);
        setElection(electionResponse.data);
        
        // Check if user has already voted
        const voteCheckResponse = await api.get(`/voters/check/${id}`);
        setHasVoted(voteCheckResponse.data.hasVoted);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load election data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.post('/voters/vote', {
        electionId: id,
        candidateId: selectedCandidate
      });
      
      toast.success('Your vote has been cast successfully');
      setHasVoted(true);
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Election not found</p>
        <Link 
          to="/voter" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/voter')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h1>
          <p className="text-gray-600">{election.description}</p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Start Date</p>
                <p className="text-gray-600">{formatDate(election.startDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">End Date</p>
                <p className="text-gray-600">{formatDate(election.endDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Candidates</p>
                <p className="text-gray-600">{election.candidates.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {election.status === 'upcoming' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <Clock className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">This election hasn't started yet</h2>
            <p className="text-gray-600 mb-4">
              Please check back on {formatDate(election.startDate)} to cast your vote.
            </p>
            <Link 
              to="/voter"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : election.status === 'completed' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">This election has ended</h2>
            <p className="text-gray-600 mb-4">
              The voting period for this election has concluded on {formatDate(election.endDate)}.
            </p>
            <Link 
              to={`/election/results/${election._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Results
            </Link>
          </div>
        ) : hasVoted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank you for voting!</h2>
            <p className="text-gray-600 mb-4">
              Your vote has been recorded. The results will be available after the election ends on {formatDate(election.endDate)}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/voter/history"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                View Your Voting History
              </Link>
              <Link 
                to="/voter"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Candidate</h2>
            
            <div className="space-y-4 mb-8">
              {election.candidates.map((candidate) => (
                <label 
                  key={candidate._id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate === candidate._id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate._id}
                      checked={selectedCandidate === candidate._id}
                      onChange={() => setSelectedCandidate(candidate._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    
                    <div className="ml-4 flex flex-1 items-center">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-12 h-12 object-cover rounded-full mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full mr-4">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || submitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {submitting ? (
                  <span className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                ) : (
                  <Vote className="h-5 w-5 mr-2" />
                )}
                Cast Your Vote
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Your vote is secure and anonymous. Once submitted, it cannot be changed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotePage;