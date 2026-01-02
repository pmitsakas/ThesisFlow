import React, { useState, useEffect } from 'react';
import { dissertationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiUser } from 'react-icons/fi';

const MyProposals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getAll();
      const studentProposals = response.data.data.filter(
        d => d.studentId?._id === user._id && d.status === 'pending_approval'
      );
      setProposals(studentProposals);
      setError('');
    } catch (err) {
      setError('Failed to load proposals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_approval': {
        icon: <FiClock className="w-4 h-4" />,
        text: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'assigned': {
        icon: <FiCheckCircle className="w-4 h-4" />,
        text: 'Approved',
        color: 'bg-green-100 text-green-800'
      }
    };
    return badges[status] || badges['pending_approval'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
            <p className="mt-2 text-gray-600">Track your submitted dissertation proposals</p>
          </div>
          <button
            onClick={() => navigate('/propose-topic')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Proposal
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Proposals Yet</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any dissertation proposals</p>
            <button
              onClick={() => navigate('/propose-topic')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Submit Your First Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProposalCard = ({ proposal, getStatusBadge }) => {
  const statusBadge = getStatusBadge(proposal.status);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {proposal.track}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                {statusBadge.icon}
                {statusBadge.text}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{proposal.title}</h3>
            {proposal.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{proposal.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <FiUser className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Supervisor</p>
              <p className="font-medium text-gray-900">
                {proposal.supervisorId?.name} {proposal.supervisorId?.surname}
              </p>
            </div>
          </div>

          {proposal.deadline && (
            <div className="flex items-center text-sm text-gray-600">
              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="font-medium text-gray-900">
                  {new Date(proposal.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <FiClock className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="font-medium text-gray-900">
                {new Date(proposal.date_created).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {proposal.status === 'pending_approval' && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⏳ Your proposal is waiting for supervisor review. You will be notified once a decision is made.
            </p>
          </div>
        )}

        {proposal.status === 'assigned' && (
          <div className="mt-4">
            <a
              href={`/dissertation/${proposal._id}`}
              className="w-full block text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
            >
              View Dissertation
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProposals;