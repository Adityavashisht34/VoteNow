import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Candidate {
  name: string;
  description: string;
  photoUrl: string;
}

const CreateElection: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([
    { name: '', description: '', photoUrl: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const addCandidate = () => {
    setCandidates([...candidates, { name: '', description: '', photoUrl: '' }]);
  };
  
  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      const updatedCandidates = [...candidates];
      updatedCandidates.splice(index, 1);
      setCandidates(updatedCandidates);
    } else {
      toast.error('Election must have at least one candidate');
    }
  };
  
  const handleCandidateChange = (index: number, field: keyof Candidate, value: string) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index][field] = value;
    setCandidates(updatedCandidates);
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Please enter an election title');
      return false;
    }
    
    if (!description.trim()) {
      toast.error('Please enter an election description');
      return false;
    }
    
    if (!startDate) {
      toast.error('Please select a start date');
      return false;
    }
    
    if (!endDate) {
      toast.error('Please select an end date');
      return false;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    
    if (new Date(startDate) < new Date()) {
      toast.error('Start date cannot be in the past');
      return false;
    }
    
    for (const candidate of candidates) {
      if (!candidate.name.trim() || !candidate.description.trim()) {
        toast.error('All candidates must have a name and description');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/elections', {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        candidates
      }
      
    );
      
      toast.success('Election created successfully');
      navigate(`/admin/election/${response.data.election._id}`);
    } catch (error) {
      console.error('Error creating election:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Election</h1>
          <p className="text-gray-600 mt-1">Fill in the details to set up your election</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Election Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Election Details</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Election Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Student Council Election 2025"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide details about this election..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date and Time *
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date and Time *
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Candidates */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Candidates</h2>
              <button
                type="button"
                onClick={addCandidate}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Candidate
              </button>
            </div>
            
            {candidates.map((candidate, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Candidate {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCandidate(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Remove candidate"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Candidate's full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={candidate.description}
                      onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description or platform statement"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={candidate.photoUrl}
                      onChange={(e) => handleCandidateChange(index, 'photoUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md mr-3 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
              )}
              Create Election
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateElection;