import React, { useState, useEffect, useRef } from 'react';
import { dissertationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiClock, FiCheckCircle, FiUser, FiCalendar,
  FiZap, FiLoader, FiPlus, FiEdit3, FiInfo, FiX
} from 'react-icons/fi';

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT': 'bg-blue-100 text-blue-800',
  'BI': 'bg-green-100 text-green-800',
};

const buildPromptPreview = (profile, track) => {
  const p = profile || {};
  return `Academic Track: ${track}
  Core Courses: ${p.coreCoursesFavorites?.join(', ') || 'Not specified'}
  Advanced Topics: ${p.advancedTopicsInterest?.join(', ') || 'Not specified'}
  Research Areas: ${p.researchAreas?.join(', ') || 'Not specified'}
  Languages: ${p.programmingLanguages?.join(', ') || 'Not specified'}
  Career Goals: ${p.careerGoals || 'Not specified'}
  Methodology: ${p.researchMethodology || 'Not specified'}
  Hours/Week: ${p.weeklyHours || 10}
  Difficulty: ${p.difficultyLevel || 'intermediate'}`;
};

const MyProposals = () => {
  const { user, hasActiveDissertation } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [propForm, setPropForm] = useState({ title: '', description: '', supervisorId: '' });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submittingProp, setSubmittingProp] = useState(false);
  const [propError, setPropError] = useState('');
  const [propSuccess, setPropSuccess] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const teachersLoaded = useRef(false);

  const today = new Date().toISOString().slice(0, 10);
  const studentTrack = user?.track || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dissRes, profileRes] = await Promise.all([
        dissertationAPI.getMyDissertations(),
        userAPI.getMyProfile()
      ]);

      const studentProposals = dissRes.data.data.filter(
        d => d.status === 'pending_approval'
      );
      setProposals(studentProposals);
      setProfile(profileRes.data.data.studentProfile || null);

      if (!teachersLoaded.current) {
        const teachRes = await userAPI.getActiveTeachers();
        setTeachers(teachRes.data.data || []);
        teachersLoaded.current = true;
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setPropError('');
    try {
      const res = await userAPI.generateProposal(studentTrack);
      const ai = res.data.data;
      setPropForm(prev => ({
        ...prev,
        title: ai.title || prev.title,
        description: ai.description || prev.description
      }));
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to generate proposal.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propForm.title || !propForm.description || !propForm.supervisorId) {
      setPropError('Please fill in title, description and supervisor.');
      return;
    }
    setSubmittingProp(true);
    setPropError('');
    setPropSuccess('');
    try {
      await dissertationAPI.propose({
        tracks: [studentTrack],
        title: propForm.title,
        description: propForm.description,
        supervisorId: propForm.supervisorId
      });
      setPropForm({ title: '', description: '', supervisorId: '' });
      setPropSuccess('Proposal submitted successfully!');
      setTimeout(() => setPropSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingProp(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Είσαι σίγουρος ότι θέλεις να αποσύρεις αυτήν την πρόταση;')) return;
    try {
      await dissertationAPI.withdrawProposal(id);
      setProposals(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to withdraw proposal.');
    }
  };

  if (hasActiveDissertation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
          <FiCheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">You have an active dissertation</h2>
          <p className="text-gray-500 text-sm mb-6">You cannot submit new proposals while you have an assigned dissertation.</p>
          <a href="/my-dissertation" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            View My Dissertation
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="mt-2 text-gray-600">Submit new dissertation proposals and track their status</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: new proposal form */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit3 className="text-purple-600 w-5 h-5" /> New Proposal
                </h2>
                <div className="relative inline-flex">
                  {!generatingAI && (
                    <span className="absolute inset-0 rounded-lg animate-ping bg-gradient-to-r from-purple-400 to-blue-400 opacity-30" />
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    onMouseEnter={() => setShowPrompt(true)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${generatingAI
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                      }`}
                  >
                    <span className="relative flex items-center gap-2">
                      {generatingAI
                        ? <><FiLoader className="w-4 h-4 animate-spin" /> Δημιουργία...</>
                        : <><FiZap className="w-4 h-4 animate-bounce" /> Generate with AI</>
                      }
                    </span>
                  </button>
                </div>
              </div>

              {propError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{propError}</div>
              )}
              {propSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4" /> {propSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {studentTrack && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${TRACK_COLORS[studentTrack] || 'bg-gray-100 text-gray-700'}`}>
                      {studentTrack}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propForm.title}
                    onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                    maxLength={200}
                    placeholder="Enter a descriptive title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">{propForm.title.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={propForm.description}
                    onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                    maxLength={3000}
                    rows={5}
                    placeholder="Describe your proposed dissertation topic..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">{propForm.description.length}/3000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Supervisor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={propForm.supervisorId}
                    onChange={e => setPropForm(p => ({ ...p, supervisorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a supervisor</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} {t.surname}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingProp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm transition"
                >
                  {submittingProp
                    ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><FiPlus className="w-4 h-4" /> Submit Proposal</>
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Right: existing proposals */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-yellow-500 w-5 h-5" />
              Submitted Proposals
              <span className="ml-auto text-sm font-normal text-gray-500">{proposals.length} total</span>
            </h2>

            {proposals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiEdit3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No proposals submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <div key={proposal._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleWithdraw(proposal._id)}
                            className="text-gray-300 hover:text-red-500 transition flex-shrink-0 ml-2"
                            title="Απόσυρση πρότασης"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {proposal.tracks && proposal.tracks.map(t => (
                              <span key={t} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TRACK_COLORS[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
                            ))}
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <FiClock className="w-3 h-3" /> Pending Review
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 leading-snug">{proposal.title}</h3>
                          {proposal.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{proposal.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Supervisor</p>
                            <p className="font-medium text-gray-800 text-xs">
                              {proposal.supervisorId?.name} {proposal.supervisorId?.surname}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">Submitted</p>
                            <p className="font-medium text-gray-800 text-xs">
                              {new Date(proposal.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                          ⏳ Waiting for supervisor review. You will be notified once a decision is made.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProposals;