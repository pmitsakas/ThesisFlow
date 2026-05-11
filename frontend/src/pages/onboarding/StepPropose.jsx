import React, { useState } from 'react';
import { FiArrowLeft, FiLoader, FiZap, FiEdit3, FiInfo, FiCheckCircle, FiPlus, FiUser, FiX, FiMaximize2 } from 'react-icons/fi';
import { TRACK_COLORS, TRACK_LABELS } from './constants';

const buildPromptPreview = (profile, track) => {
  const p = profile || {};
  return `STUDENT PROFILE:
  - Academic Track: ${track}
  - Topics of Interest: ${p.advancedTopicsInterest?.join(', ') || 'Not specified'}
  - Programming Languages: ${p.programmingLanguages?.join(', ') || 'Not specified'}
  - Project Style: ${p.researchMethodology || 'Not specified'}
  - Difficulty Level: ${p.difficultyLevel || 'Not specified'}
  - Goals: ${p.careerGoals || 'Not specified'}

  → Generate: title (10-200 chars), description (<1800 chars)`;
};

const StepPropose = ({
  selectedTrack, profile, propForm, setPropForm,
  teachers, generatingAI, submittingProp,
  propError, onGenerate, onSubmit, onBack, onFinish,
  submittedProposals, today, onWithdraw
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {showDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-lg">Proposal Description</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDesc(e => !e)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  <FiEdit3 className="w-3 h-3" />
                  {editingDesc ? 'Cancel edit' : 'Edit'}
                </button>
                <button onClick={() => { setShowDescModal(false); setEditingDesc(false); }} className="text-gray-400 hover:text-gray-600 transition">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea
                      value={propForm.description}
                      onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                      maxLength={4000}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-0.5">{propForm.description?.length || 0}/4000</p>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">{propForm.title || '-'}</h4>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white mb-4 shadow-lg">
          <FiEdit3 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Propose a dissertation topic</h1>
        <p className="text-gray-500">You can submit as many proposals as you like. Supervisors will review them.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">New Proposal</h2>
            <div className="relative inline-flex">
              {!generatingAI && (
                <span className="absolute inset-0 rounded-lg animate-ping bg-gradient-to-r from-purple-400 to-blue-400 opacity-30" />
              )}
              <button
                type="button"
                onClick={onGenerate}
                disabled={generatingAI}
                onMouseEnter={() => setShowPrompt(true)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${generatingAI
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
              >
                <span className="relative flex items-center gap-2">
                  {generatingAI
                    ? <><FiLoader className="w-4 h-4 animate-spin" /> Create...</>
                    : <><FiZap className="w-4 h-4 animate-bounce" /> Generate with AI</>
                  }
                </span>
              </button>
            </div>
          </div>

          {propError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{propError}</div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${TRACK_COLORS[selectedTrack]}`}>
                {selectedTrack} - {TRACK_LABELS[selectedTrack]}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title  <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={propForm.title}
                onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                maxLength={200}
                placeholder="e.g. Development of a system..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                  >
                    <FiMaximize2 className="w-3 h-3" />
                    Full preview
                  </button>
                )}
              </div>
              <textarea
                value={propForm.description}
                onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                maxLength={400}
                rows={7}
                placeholder="Describe what you want to do..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{propForm.description?.length || 0}/4000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor  <span className="text-red-500">*</span>
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingProp
                ? <><FiLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                : <><FiPlus className="w-4 h-4" /> Submit Proposal</>
              }
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex-1">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-green-500 w-5 h-5" />
              Submitted Proposals
              {submittedProposals.length > 0 && (
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {submittedProposals.length}
                </span>
              )}
            </h2>

            {submittedProposals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FiEdit3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">You haven't submitted any proposals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submittedProposals.map((p, idx) => (
                  <div key={p._id} className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-green-700 mb-0.5">#{idx + 1}</p>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p.title}</p>
                        {p.supervisorId && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {p.supervisorId.name} {p.supervisorId.surname}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onWithdraw(p._id)}
                        className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                        title="Remove proposal"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <FiArrowLeft className="w-4 h-4" /> Πίσω
            </button>
            <button
              onClick={onFinish}
              disabled={submittedProposals.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm transition"
            >
              <FiCheckCircle className="w-4 h-4" />
              Finish ({submittedProposals.length} proposal{submittedProposals.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPropose;