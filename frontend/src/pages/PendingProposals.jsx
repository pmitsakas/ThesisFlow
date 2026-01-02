import React, { useState, useEffect } from 'react';
import { dissertationAPI } from '../services/api';
import { FiClock, FiUser, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PendingProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getPendingProposals();
      setProposals(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load proposals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId) => {
    if (!window.confirm('Are you sure you want to approve this proposal? The dissertation will be automatically assigned to the student.')) {
      return;
    }

    try {
      setProcessing(proposalId);
      await dissertationAPI.approveProposal(proposalId);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to approve proposal');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(proposalId);
      await dissertationAPI.rejectProposal(proposalId);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to reject proposal');
    } finally {
      setProcessing(null);
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Proposals</h1>
          <p className="mt-2 text-gray-600">Review and respond to student dissertation proposals</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FiClock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Pending Proposals</h3>
            <p className="text-gray-600">You don't have any student proposals waiting for review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                onApprove={() => handleApprove(proposal._id)}
                onReject={() => handleReject(proposal._id)}
                isProcessing={processing === proposal._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProposalCard = ({ proposal, onApprove, onReject, isProcessing }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {proposal.track}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                Pending Review
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{proposal.title}</h3>
          </div>
        </div>

        {proposal.description && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{proposal.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <FiUser className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Student</p>
              <p className="font-medium text-gray-900">
                {proposal.studentId?.name} {proposal.studentId?.surname}
              </p>
              <p className="text-xs text-gray-500">{proposal.studentId?.email}</p>
            </div>
          </div>

          {proposal.deadline && (
            <div className="flex items-center text-sm text-gray-600">
              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Proposed Deadline</p>
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

        <div className="flex gap-3">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiCheckCircle className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Approve & Assign'}
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiXCircle className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingProposals;