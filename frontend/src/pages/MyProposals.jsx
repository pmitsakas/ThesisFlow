import React, { useState, useEffect, useRef } from 'react';
import { dissertationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import {
  FiClock, FiCheckCircle, FiUser, FiCalendar,
  FiEdit3, FiX
} from 'react-icons/fi';

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT':    'bg-blue-100 text-blue-800',
  'BI':    'bg-green-100 text-green-800',
};

const MyProposals = () => {
  const { user, hasActiveDissertation } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dissRes = await dissertationAPI.getMyDissertations();
      setProposals(dissRes.data.data.filter(d => d.status === 'pending_approval'));
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      await dissertationAPI.withdrawProposal(id);
      setProposals(prev => prev.filter(p => p._id !== id));
    } catch (err) { setError(err.response?.data?.error?.message || 'Failed to withdraw proposal.'); }
  };

  if (hasActiveDissertation) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
        <FiCheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-[#1a237e] mb-2">You have an active dissertation</h2>
        <p className="text-gray-500 text-sm mb-6">You cannot submit new proposals while you have an assigned dissertation.</p>
        <a href="/my-dissertation" className={`${tw.btnPrimary} px-6 py-2.5 text-sm inline-block`}>View My Dissertation</a>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">My Proposals</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
          <p className="mt-2 text-gray-500">Track your submitted dissertation proposals</p>
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a237e] flex items-center gap-2">
            <FiClock className="w-5 h-5 text-[#f26522]" /> Submitted Proposals
          </h2>
          <span className="text-sm text-gray-500">{proposals.length} total</span>
        </div>

        {proposals.length === 0 ? (
          <div className={`${tw.card} p-12 text-center`}>
            <FiEdit3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm mb-2">No proposals submitted yet</p>
            <p className="text-xs text-gray-400">Go to your Dashboard to submit a new proposal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map(proposal => (
              <div key={proposal._id} className={`${tw.cardHover} overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {proposal.tracks?.map(t => (
                          <span key={t} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TRACK_COLORS[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
                        ))}
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <FiClock className="w-3 h-3" /> Pending Review
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1a237e] leading-snug">{proposal.title}</h3>
                      {proposal.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{proposal.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleWithdraw(proposal._id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0 ml-2"
                      title="Withdraw proposal"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-[#f26522] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Supervisor</p>
                        <p className="font-medium text-gray-800 text-xs">
                          {proposal.supervisorId?.name} {proposal.supervisorId?.surname}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-[#f26522] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Submitted</p>
                        <p className="font-medium text-gray-800 text-xs">
                          {new Date(proposal.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-[#f26522]/5 border border-[#f26522]/20 rounded-lg p-3">
                    <p className="text-xs text-[#f26522]">
                      Waiting for supervisor review. You will be notified once a decision is made.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProposals;