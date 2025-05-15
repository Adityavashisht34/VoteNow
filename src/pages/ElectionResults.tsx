import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Award, Users, BarChart2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Candidate {
  _id: string;
  name: string;
  description: string;
  photoUrl?: string;
}

interface CandidateResult {
  candidate: Candidate;
  voteCount: number;
}

interface ElectionResult {
  electionTitle: string;
  totalVotes: number;
  results: CandidateResult[];
}

const ElectionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<ElectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/elections/${id}/results`);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching election results:', error);
        toast.error('Failed to load election results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Results not available yet or election not found</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }
  
  // Calculate percentages and find winner
  const calculatePercentage = (votes: number) => {
    if (results.totalVotes === 0) return 0;
    return (votes / results.totalVotes) * 100;
  };
  
  const getWinner = () => {
    if (results.results.length === 0) return null;
    return results.results[0]; // Results are already sorted by vote count
  };
  
  const winner = getWinner();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
          <p className="text-gray-600 mt-1">{results.electionTitle}</p>
        </div>
        
        {/* Winner Section */}
        {winner && (
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4 md:mb-0 md:mr-6">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-blue-700 mb-1">WINNER</p>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{winner.candidate.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{winner.candidate.description}</p>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="text-blue-700 font-semibold">{winner.voteCount} votes</span>
                  <span className="mx-2 text-gray-500">•</span>
                  <span className="text-blue-700 font-semibold">
                    {calculatePercentage(winner.voteCount).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vote Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Vote Summary</h2>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700">{results.totalVotes}</p>
                <p className="text-sm text-gray-600">Total Votes Cast</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Breakdown */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Results Breakdown</h2>
          </div>
          
          <div className="space-y-4">
            {results.results.map((result, index) => {
              const percentage = calculatePercentage(result.voteCount);
              
              return (
                <div key={result.candidate._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 mr-2">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {result.candidate.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {result.voteCount} votes
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionResults;