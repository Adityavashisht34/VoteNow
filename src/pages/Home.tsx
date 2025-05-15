import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VoteIcon, Shield, FileText } from 'lucide-react';
import api from '../services/api';
import ElectionCard from '../components/ElectionCard';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [activeElections, setActiveElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections');
        const elections = response.data;
        
        // Filter active elections for the homepage
        const active = elections.filter(election => election.status === 'active');
        setActiveElections(active);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setLoading(false);
      }
    };
    
    fetchElections();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Secure Digital Voting for Everyone</h1>
          <p className="text-lg mb-8 opacity-90">
            Our platform provides a secure and transparent way to conduct elections online.
            Create, manage, and participate in elections with complete confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/voter'}
                className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors shadow-md"
                >
                  Register Now
                </Link>
                <Link 
                  to="/login"
                  className="px-6 py-3 bg-opacity-20 hover:bg-opacity-30 bg-white text-white border border-white border-opacity-40 font-medium rounded-lg transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="my-16">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">Why Choose Our Platform</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Secure Voting</h3>
            <p className="text-gray-600">
              Industry-standard encryption and authentication ensures your votes remain secure and private.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <VoteIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Easy Administration</h3>
            <p className="text-gray-600">
              Simple tools for creating and managing elections with real-time results and analytics.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Transparent Results</h3>
            <p className="text-gray-600">
              Complete transparency with detailed voting statistics and verifiable results.
            </p>
          </div>
        </div>
      </section>
      
      {/* Active Elections Section */}
      <section className="my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Active Elections</h2>
          {isAuthenticated && user?.role === 'voter' && (
            <Link 
              to="/voter" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Elections
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          </div>
        ) : activeElections.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election) => (
              <ElectionCard 
                key={election._id} 
                election={election} 
                userRole={user?.role || null} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No active elections at the moment.</p>
            {isAuthenticated && user?.role === 'admin' && (
              <Link 
                to="/admin/create-election" 
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create an Election
              </Link>
            )}
          </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="bg-gray-100 rounded-xl p-8 text-center my-16">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Ready to get started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of organizations that trust our platform for their voting needs.
        </p>
        
        {!isAuthenticated && (
          <Link 
            to="/register" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Create an Account
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;