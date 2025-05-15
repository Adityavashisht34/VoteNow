import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface Candidate {
  _id: string;
  name: string;
  description: string;
  photoUrl?: string;
}

interface ElectionCardProps {
  election: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'completed';
    candidates: Candidate[];
  };
  userRole: 'admin' | 'voter' | null;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election, userRole }) => {
  const { _id, title, description, startDate, endDate, status, candidates } = election;
  
  const statusColors = {
    upcoming: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  
  const getButtonProps = () => {
    if (!userRole) {
      return {
        text: 'View Details',
        to: `/`,
        className: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    
    if (userRole === 'admin') {
      return {
        text: 'Manage Election',
        to: `/admin/election/${_id}`,
        className: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    
    if (userRole === 'voter') {
      if (status === 'active') {
        return {
          text: 'Vote Now',
          to: `/voter/election/${_id}`,
          className: 'bg-green-600 hover:bg-green-700'
        };
      } else if (status === 'upcoming') {
        return {
          text: 'View Details',
          to: `/voter/election/${_id}`,
          className: 'bg-yellow-600 hover:bg-yellow-700'
        };
      } else {
        return {
          text: 'View Results',
          to: `/election/results/${_id}`,
          className: 'bg-blue-600 hover:bg-blue-700'
        };
      }
    }
    
    return {
      text: 'View Details',
      to: `/`,
      className: 'bg-blue-600 hover:bg-blue-700'
    };
  };
  
  const buttonProps = getButtonProps();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 truncate">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Start: {formatDate(startDate)}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>End: {formatDate(endDate)}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="h-4 w-4 mr-2" />
            <span>{candidates.length} Candidates</span>
          </div>
        </div>
        
        <Link 
          to={buttonProps.to}
          className={`mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${buttonProps.className}`}
        >
          {buttonProps.text}
        </Link>
      </div>
    </div>
  );
};

export default ElectionCard;