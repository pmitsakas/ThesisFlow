import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiLoader, FiZap, FiEdit3, FiInfo } from 'react-icons/fi';
import { TRACK_COLORS, TRACK_LABELS } from './constants';

const buildPromptPreview = (profile, track) => {
  const p = profile || {};
  return `You are an expert academic advisor specializing in Computer Science dissertations.

Generate a personalized dissertation proposal based on the following student profile:

STUDENT PROFILE:
- Academic Track: ${track}
- Core Courses Favorites: ${p.coreCoursesFavorites?.join(', ') || 'Not specified'}
- Advanced Topics Interest: ${p.advancedTopicsInterest?.join(', ') || 'Not specified'}
- Research Areas: ${p.researchAreas?.join(', ') || 'Not specified'}
- Programming Languages: ${p.programmingLanguages?.join(', ') || 'Not specified'}
- Career Goals: ${p.careerGoals || 'Not specified'}
- Research Methodology: ${p.researchMethodology || 'Not specified'}
- Available Hours/Week: ${p.weeklyHours || 10}
- Difficulty Level: ${p.difficultyLevel || 'intermediate'}

→ Generate: title (10-200 chars), description (<1800 chars), suggestedDeadline (ISO date)`;
};

const StepPropose = ({
  selectedTrack, profile, propForm, setPropForm,
  teachers, generatingAI, submittingProp,
  propError, onGenerate, onSubmit, onBack, onSkip, today
}) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white mb-4 shadow-lg">
          <FiEdit3 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Πρότεινε τη δική σου θεματική</h1>
        <p className="text-gray-500">Μετά θα επιλέξεις 8 ακόμα από τις υπάρχουσες εργασίες</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">
        {propError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{propError}</div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Track</label>
            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${TRACK_COLORS[selectedTrack]}`}>
              {selectedTrack} - {TRACK_LABELS[selectedTrack]}
            </span>
          </div>

          <div className="flex items-end gap-2">
            <div className="relative flex items-end gap-2">
              <button
                type="button"
                onClick={onGenerate}
                disabled={generatingAI}
                onMouseEnter={() => setShowPrompt(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  generatingAI
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm'
                }`}
              >
                {generatingAI
                  ? <FiLoader className="w-4 h-4 animate-spin" />
                  : <FiZap className="w-4 h-4" />
                }
                {generatingAI ? 'Δημιουργία...' : 'Παραγωγή AI'}
              </button>

              {showPrompt && !generatingAI && (
                <div
                  className="absolute left-full top-0 ml-3 w-96 z-50"
                  onMouseLeave={() => setShowPrompt(false)}
                >
                  <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2">
                      <FiInfo className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Prompt που θα σταλεί στο Gemini</span>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                      {buildPromptPreview(profile, selectedTrack)}
                    </pre>
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500">Το προφίλ σου καθορίζει την ποιότητα της πρότασης</p>
                    </div>
                  </div>
                  <div className="absolute -left-2 top-3 w-4 h-4 bg-gray-900 border-l border-b border-gray-700 transform rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Τίτλος <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={propForm.title}
            onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
            maxLength={200}
            placeholder="π.χ. Ανάπτυξη συστήματος..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Περιγραφή <span className="text-red-500">*</span>
          </label>
          <textarea
            value={propForm.description}
            onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
            maxLength={3000}
            rows={5}
            placeholder="Περίγραψε τι θέλεις να κάνεις..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Επιβλέπων <span className="text-red-500">*</span>
            </label>
            <select
              value={propForm.supervisorId}
              onChange={e => setPropForm(p => ({ ...p, supervisorId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Επέλεξε καθηγητή</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} {t.surname}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <FiArrowLeft className="w-4 h-4" /> Πίσω
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition">
              Παράλειψη
            </button>
            <button
              type="submit"
              disabled={submittingProp}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingProp
                ? <><FiLoader className="w-4 h-4 animate-spin" /> Υποβολή...</>
                : <><FiArrowRight className="w-4 h-4" /> Υποβολή & Συνέχεια</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StepPropose;
