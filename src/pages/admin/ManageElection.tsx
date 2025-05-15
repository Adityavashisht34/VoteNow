import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Share2, Clock, User, Calendar, ExternalLink } from 'lucide-react';
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
  createdAt: string;
}

const ManageElection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingElection, setDeletingElection] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await api.get(`/elections/${id}`);
        setElection(response.data);
      } catch (error) {
        console.error('Error fetching election details:', error);
        toast.error('Failed to load election details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchElection();
  }, [id]);
  
  const handleDeleteElection = async () => {
    if (!election) return;
    
    setDeletingElection(true);
    
    try {
      await api.delete(`/elections/${id}`);
      toast.success('Election deleted successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting election:', error);
    } finally {
      setDeletingElection(false);
      setShowDeleteModal(false);
    }
  };
  
  const copyElectionLink = () => {
    const link = `${window.location.origin}/voter/election/${id}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Election link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
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
          to="/admin" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  const statusColors = {
    upcoming: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{election.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[election.status]}`}>
                  {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{election.description}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              {election.status === 'completed' && (
                <Link 
                  to={`/election/results/${election._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Results
                </Link>
              )}
              
              <button
                onClick={copyElectionLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              
              {election.status === 'upcoming' && (
                <>
                  <Link 
                    to={`/admin/edit-election/${election._id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Election Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm font-medium text-gray-700">Number of Candidates</p>
                <p className="text-gray-600">{election.candidates.length}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-gray-600">{formatDate(election.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidates</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {election.candidates.map((candidate) => (
              <div 
                key={candidate._id} 
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex"
              >
                {candidate.photoUrl ? (
                  <div className="mr-4">
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="mr-4 flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full text-gray-500">
                    <User className="h-8 w-8" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Election</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{election.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteElection}
                disabled={deletingElection}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {deletingElection && (
                  <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageElection;