import React, { useState, useEffect, useRef } from 'react';
import { dissertationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import { FiX, FiZap, FiLoader, FiPlus, FiCheckCircle, FiMaximize2, FiEdit3 } from 'react-icons/fi';

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT':    'bg-blue-100 text-blue-800',
  'BI':    'bg-green-100 text-green-800',
};

const ProposalModal = ({ onClose, onSubmitted }) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [propForm, setPropForm] = useState({ title: '', description: '', supervisorId: '' });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propError, setPropError] = useState('');
  const [propSuccess, setPropSuccess] = useState('');
  const [showDescModal, setShowDescModal] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const teachersLoaded = useRef(false);
  const studentTrack = user?.track || '';

  useEffect(() => {
    const fetchTeachers = async () => {
      if (teachersLoaded.current) return;
      try {
        const res = await userAPI.getActiveTeachers();
        setTeachers(res.data.data || []);
        teachersLoaded.current = true;
      } catch { setPropError('Failed to load teachers'); }
    };
    fetchTeachers();
  }, []);

  const handleGenerateAI = async () => {
    setGeneratingAI(true); setPropError('');
    try {
      const res = await userAPI.generateProposal(studentTrack);
      const ai = res.data.data;
      setPropForm(prev => ({ ...prev, title: ai.title || prev.title, description: ai.description || prev.description }));
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to generate proposal.');
    } finally { setGeneratingAI(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propForm.title || !propForm.description || !propForm.supervisorId) {
      setPropError('Please fill in title, description and supervisor.');
      return;
    }
    setSubmitting(true); setPropError('');
    try {
      await dissertationAPI.propose({
        tracks: [studentTrack],
        title: propForm.title,
        description: propForm.description,
        supervisorId: propForm.supervisorId
      });
      setPropSuccess('Proposal submitted successfully!');
      setTimeout(() => { onSubmitted && onSubmitted(); onClose(); }, 1500);
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to submit proposal.');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

          <div className="bg-[#1a237e] px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FiEdit3 className="w-4 h-4" /> New Proposal
              </h2>
              <div className="w-6 h-0.5 bg-[#f26522] mt-1 rounded-full" />
            </div>
            <button onClick={onClose} className="text-blue-200 hover:text-white transition">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 overflow-y-auto flex-1">
            {propError && <div className={`${tw.alertError} mb-4`}>{propError}</div>}
            {propSuccess && (
              <div className={`${tw.alertSuccess} mb-4 flex items-center gap-2`}>
                <FiCheckCircle className="w-4 h-4" /> {propSuccess}
              </div>
            )}

            <div className="flex justify-center mb-4">
              <div className="relative inline-flex">
                {!generatingAI && (
                  <span className="absolute inset-0 rounded-lg animate-ping bg-[#f26522]/40 opacity-50" />
                )}
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    generatingAI
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#f26522] hover:bg-[#d4541a] text-white shadow-md hover:scale-105'
                  }`}
                >
                  {generatingAI
                    ? <><FiLoader className="w-3 h-3 animate-spin" /> Generating...</>
                    : <><FiZap className="w-3 h-3" /> Generate with AI</>
                  }
                </button>
              </div>
            </div>

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
                  className={tw.input}
                  required
                />
                <p className="mt-1 text-xs text-gray-400">{propForm.title.length}/200</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  {propForm.description && (
                    <button
                      type="button"
                      onClick={() => setShowDescModal(true)}
                      className="flex items-center gap-1 text-xs text-[#1565c0] hover:text-[#f26522] transition"
                    >
                      <FiMaximize2 className="w-3 h-3" /> Full preview
                    </button>
                  )}
                </div>
                <textarea
                  value={propForm.description}
                  onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                  maxLength={4000}
                  rows={6}
                  placeholder="Describe your proposed dissertation topic..."
                  className={tw.textarea}
                  required
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{propForm.description.length}/4000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Supervisor <span className="text-red-500">*</span>
                </label>
                <select
                  value={propForm.supervisorId}
                  onChange={e => setPropForm(p => ({ ...p, supervisorId: e.target.value }))}
                  className={tw.select}
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
                disabled={submitting}
                className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {submitting
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <><FiPlus className="w-4 h-4" /> Submit Proposal</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>

      {showDescModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1a237e] text-lg">Proposal Description</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDesc(e => !e)}
                  className="flex items-center gap-1 text-xs text-[#1565c0] hover:text-[#f26522] transition px-2 py-1 rounded-lg hover:bg-[#f26522]/5"
                >
                  <FiEdit3 className="w-3 h-3" />
                  {editingDesc ? 'Cancel edit' : 'Edit'}
                </button>
                <button
                  onClick={() => { setShowDescModal(false); setEditingDesc(false); }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
              {editingDesc ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={propForm.title}
                      onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                      maxLength={200}
                      className={tw.input}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea
                      value={propForm.description}
                      onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                      maxLength={4000}
                      rows={10}
                      className={tw.textarea}
                    />
                    <p className="text-xs text-gray-400 text-right mt-0.5">{propForm.description?.length || 0}/4000</p>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-[#1a237e]">{propForm.title || '-'}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{propForm.description || '-'}</p>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              {editingDesc && (
                <button
                  onClick={() => setEditingDesc(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Done
                </button>
              )}
              <button
                onClick={() => { setShowDescModal(false); setEditingDesc(false); }}
                className={`${tw.btnPrimary} px-4 py-2 text-sm`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalModal;