import React, { useState, useEffect } from 'react';
import { dissertationAPI } from '../services/api';
import { tw } from '../theme';
import { FiClock, FiUser, FiCheckCircle, FiXCircle, FiEdit2 } from 'react-icons/fi';

const PendingProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchProposals(); }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getPendingProposals();
      setProposals(response.data.data);
      setError('');
    } catch { setError('Failed to load proposals'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (proposalId, editedData) => {
    try {
      setProcessing(proposalId);
      await dissertationAPI.approveProposal(proposalId, editedData);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to approve proposal');
    } finally { setProcessing(null); }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) return;
    try {
      setProcessing(proposalId);
      await dissertationAPI.rejectProposal(proposalId);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to reject proposal');
    } finally { setProcessing(null); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">Pending Proposals</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
          <p className="mt-2 text-gray-500">Review and respond to student dissertation proposals</p>
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

        {proposals.length === 0 ? (
          <div className={`${tw.card} p-12 text-center`}>
            <FiClock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-[#1a237e] mb-2">No Pending Proposals</h3>
            <p className="text-gray-500">You don't have any student proposals waiting for review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map(proposal => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                onApprove={handleApprove}
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
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(proposal.title);
  const [description, setDescription] = useState(proposal.description || '');

  const handleConfirmApprove = () => {
    onApprove(proposal._id, { title, description });
    setEditMode(false);
  };

  const TRACK_COLORS = {
    'AI&DS': 'bg-red-100 text-red-800',
    'WT':    'bg-blue-100 text-blue-800',
    'BI':    'bg-green-100 text-green-800',
  };

  return (
    <div className={`${tw.cardHover} overflow-hidden`}>
      <div className="bg-[#1a237e] px-6 py-3 flex items-center gap-2 flex-wrap">
        {proposal.tracks?.map(t => (
          <span key={t} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TRACK_COLORS[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
        ))}
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <FiClock className="w-3 h-3" /> Pending Review
        </span>
        {editMode && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#f26522]/20 text-[#f26522] flex items-center gap-1">
            <FiEdit2 className="w-3 h-3" /> Edit Mode
          </span>
        )}
      </div>

      <div className="p-6">
        {editMode ? (
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            className="w-full text-xl font-bold text-[#1a237e] border-b-2 border-[#f26522] focus:outline-none bg-[#f26522]/5 px-2 py-1 rounded-t mb-4"
          />
        ) : (
          <h3 className="text-xl font-bold text-[#1a237e] mb-4">{proposal.title}</h3>
        )}

        <div className="mb-4 p-4 bg-[#f5f5f5] rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-[#1a237e] mb-2">Description</h4>
          {editMode ? (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={4000}
              rows={Math.max(5, description.split('\n').length + 2)}
              style={{ minHeight: '120px' }}
              className="w-full text-sm text-gray-700 border border-[#f26522]/40 focus:outline-none focus:ring-2 focus:ring-[#1a237e] bg-white px-2 py-1 rounded resize-y"
            />
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{proposal.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4 text-[#f26522] flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Student</p>
              <p className="font-medium text-gray-900 text-sm">{proposal.studentId?.name} {proposal.studentId?.surname}</p>
              <p className="text-xs text-gray-400">{proposal.studentId?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-[#f26522] flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Submitted</p>
              <p className="font-medium text-gray-900 text-sm">
                {new Date(proposal.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {editMode ? (
          <div className="flex gap-3">
            <button
              onClick={handleConfirmApprove}
              disabled={isProcessing || !title}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Confirm & Approve'}
            </button>
            <button
              onClick={() => { setEditMode(false); setTitle(proposal.title); setDescription(proposal.description || ''); }}
              className={`${tw.btnOutline} px-4 py-2 text-sm`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditMode(true)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" /> Edit & Approve
            </button>
            <button
              onClick={() => onApprove(proposal._id, {})}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              className={`${tw.btnDanger} flex-1 px-4 py-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              <FiXCircle className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProposals;