import React, { useState, useEffect } from 'react';
import { dissertationAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TRACKS = ['AI&DS', 'WT', 'BI'];

const TRACK_LABELS = {
  'AI&DS': 'Artificial Intelligence & Data Science',
  'WT': 'Web Technologies',
  'BI': 'Business Informatics'
};

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT': 'bg-blue-100 text-blue-800',
  'BI': 'bg-green-100 text-green-800'
};

const BrowseTopics = () => {
  const { user } = useAuth();
  const [dissertations, setDissertations] = useState([]);
  const [filteredDissertations, setFilteredDissertations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTracks, setSelectedTracks] = useState(user?.track ? [user.track] : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedDissertation, setSelectedDissertation] = useState(null);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDissertations();
  }, [selectedTracks, searchTerm, dissertations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dissResponse, appsResponse] = await Promise.all([
        dissertationAPI.getAvailable(),
        applicationAPI.getMyApplications()
      ]);

      setDissertations(dissResponse.data.data);
      setMyApplications(appsResponse.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load dissertations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterDissertations = () => {
    let filtered = [...dissertations];

    if (selectedTracks.length > 0) {
      filtered = filtered.filter(d =>
        d.tracks && d.tracks.some(t => selectedTracks.includes(t))
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDissertations(filtered);
  };

  const toggleTrack = (track) => {
    setSelectedTracks(prev =>
      prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
    );
  };

  const hasApplied = (dissertationId) => {
    return myApplications.some(
      app => (app.dissertationId._id === dissertationId || app.dissertationId === dissertationId) && app.status === 'pending'
    );
  };

  const getAppliedTier = (dissertationId) => {
    const app = myApplications.find(
      app => (app.dissertationId._id === dissertationId || app.dissertationId === dissertationId) && app.status === 'pending'
    );
    return app?.tier;
  };

  const isRejected = (dissertationId) => {
    return myApplications.some(
      app => app.dissertationId._id === dissertationId && app.status === 'rejected'
    );
  };

  const isApproved = (dissertationId) => {
    return myApplications.some(
      app => app.dissertationId._id === dissertationId && app.status === 'approved'
    );
  };

  const handleApply = (dissertation) => {
    setSelectedDissertation(dissertation);
    setShowApplicationModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Dissertation Topics</h1>
          <p className="mt-2 text-gray-600">Explore available dissertation topics and express your interest</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description or code..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${TRACK_COLORS[user?.track] || 'bg-gray-100 text-gray-800'}`}>
              {user?.track || '-'}
            </span>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDissertations.length} of {dissertations.length} dissertations
        </div>

        {filteredDissertations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dissertations found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDissertations.map((dissertation) => (
              <DissertationCard
                key={dissertation._id}
                dissertation={dissertation}
                hasApplied={hasApplied(dissertation._id)}
                isRejected={isRejected(dissertation._id)}
                isApproved={isApproved(dissertation._id)}
                appliedTier={getAppliedTier(dissertation._id)}
                onApply={() => handleApply(dissertation)}
              />
            ))}
          </div>
        )}
      </div>

      {showApplicationModal && (
        <ApplicationModal
          dissertation={selectedDissertation}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedDissertation(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedDissertation(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const DissertationCard = ({ dissertation, hasApplied, isRejected, isApproved, appliedTier, onApply }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            {dissertation.tracks && dissertation.tracks.map(track => (
              <span
                key={track}
                className={`px-2 py-1 text-xs font-semibold rounded-full ${TRACK_COLORS[track] || 'bg-gray-100 text-gray-800'}`}
              >
                {track}
              </span>
            ))}
          </div>
          <div className="flex gap-2 ml-2 flex-shrink-0">
            {hasApplied && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Applied
              </span>
            )}
            {isRejected && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Rejected
              </span>
            )}
            {isApproved && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Approved
              </span>
            )}
          </div>
        </div>

        {dissertation.code && (
          <p className="text-xs text-gray-500 font-mono mb-1">{dissertation.code}</p>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {dissertation.title}
        </h3>

        {dissertation.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {dissertation.description}
          </p>
        )}

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Supervisor:</span>
            <span className="ml-2">
              {dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}
            </span>
          </div>

          {dissertation.deadline && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Deadline:</span>
              <span className="ml-2">
                {new Date(dissertation.deadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Posted:</span>
            <span className="ml-2">
              {new Date(dissertation.date_created).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="mt-6">
          {isApproved ? (
            <div className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-700 text-center text-sm font-semibold">
              Approved ✓
            </div>
          ) : hasApplied ? (
            <div className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-600 text-center text-sm font-semibold">
              Tier {appliedTier} Pending
            </div>
          ) : isRejected ? (
            <div className="w-full py-2 px-4 rounded-lg bg-red-100 text-red-700 text-center text-sm font-semibold">
              Rejected
            </div>
          ) : (
            <button
              onClick={onApply}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm"
            >
              Add to Declaration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationModal = ({ dissertation, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [tier, setTier] = useState(1);
  const [tierCounts, setTierCounts] = useState({ 1: 0, 2: 0, 3: 0 });
  const [takenPositions, setTakenPositions] = useState({ 1: [], 2: [], 3: [] });
  const [position, setPosition] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTierCounts = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        const counts = { 1: 0, 2: 0, 3: 0 };
        const taken = { 1: [], 2: [], 3: [] };
        res.data.data.forEach(app => {
          if (app.status !== 'rejected' && app.tier) {
            counts[app.tier] = (counts[app.tier] || 0) + 1;
            if (app.position) taken[app.tier].push(app.position);
          }
        });
        setTierCounts(counts);
        setTakenPositions(taken);
      } catch { }
    };
    loadTierCounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applicationAPI.create({
        dissertationId: dissertation._id,
        message: message.trim() || undefined,
        position
      }, tier);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Express Interest</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {dissertation.code && (
              <p className="text-xs text-gray-500 font-mono mb-1">{dissertation.code}</p>
            )}
            <h3 className="font-semibold text-gray-900 mb-2">{dissertation.title}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {dissertation.tracks && dissertation.tracks.map(track => (
                <span key={track} className={`px-2 py-1 text-xs font-semibold rounded-full ${TRACK_COLORS[track] || 'bg-gray-100 text-gray-800'}`}>
                  {track}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Supervisor: {dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Supervisor (Optional)
              </label>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setTier(t); setPosition(1); }}
                      disabled={tierCounts[t] >= 3}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition ${tier === t
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : tierCounts[t] >= 3
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
                        }`}
                    >
                      Tier {t} {tierCounts[t] >= 3 ? '(full)' : `(${tierCounts[t]}/3)`}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position in Tier {tier} <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400 font-normal">(1 = most preferred)</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((p) => {
                      const isTaken = takenPositions[tier].includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPosition(p)}
                          disabled={isTaken}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition ${position === p
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : isTaken
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                        >
                          #{p} {isTaken ? '(taken)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                maxLength="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce yourself and explain why you're interested in this topic..."
              />
              <p className="mt-1 text-xs text-gray-500">{message.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrowseTopics;
