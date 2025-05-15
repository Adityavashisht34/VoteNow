import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Activity, CheckSquare } from 'lucide-react';
import api from '../../services/api';
import ElectionCard from '../../components/ElectionCard';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections');
        setElections(response.data);
        setFilteredElections(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setLoading(false);
      }
    };
    
    fetchElections();
  }, []);
  
  useEffect(() => {
    if (filter === 'all') {
      setFilteredElections(elections);
    } else {
      setFilteredElections(elections.filter(election => election.status === filter));
    }
  }, [filter, elections]);
  
  const getElectionCounts = () => {
    return {
      total: elections.length,
      upcoming: elections.filter(election => election.status === 'upcoming').length,
      active: elections.filter(election => election.status === 'active').length,
      completed: elections.filter(election => election.status === 'completed').length
    };
  };
  
  const counts = getElectionCounts();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}</p>
        </div>
        <Link
          to="/admin/create-election"
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Election
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-3 rounded-full bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Total Elections</p>
              <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">{counts.upcoming}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-3 rounded-full bg-green-100">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{counts.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center p-3 rounded-full bg-gray-100">
              <CheckSquare className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{counts.completed}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Elections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Elections
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : filteredElections.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElections.map((election) => (
                <ElectionCard 
                  key={election._id} 
                  election={election} 
                  userRole="admin" 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No elections found.</p>
              <Link 
                to="/admin/create-election" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create your first election
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;