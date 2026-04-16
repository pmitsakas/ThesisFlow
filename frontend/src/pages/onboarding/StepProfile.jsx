import React from 'react';
import { FiArrowRight, FiArrowLeft, FiLoader, FiBookOpen, FiCode, FiTarget, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import profileQuestions from '../../config/profileQuestions.json';

const StepProfile = ({ profile, onArrayChange, onFieldChange, onNext, onBack, onSkip, saving, error }) => (
  <div className="max-w-3xl mx-auto px-4 py-10">
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 text-white mb-4 shadow-lg">
        <FiBookOpen className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Το προφίλ σου</h1>
      <p className="text-gray-500">Συμπλήρωσε τις παρακάτω πληροφορίες ώστε το AI να σου κάνει καλύτερη πρόταση</p>
    </div>

    {error && (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
    )}

    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiBookOpen className="text-blue-600 w-5 h-5" /> Favorite Core Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {profileQuestions.coreCourses.map(course => (
            <label key={course} className="flex items-center gap-2 p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition">
              <input type="checkbox" checked={profile.coreCoursesFavorites.includes(course)}
                onChange={() => onArrayChange('coreCoursesFavorites', course)}
                className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">{course}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiTarget className="text-purple-600 w-5 h-5" /> Advanced Topics Interest
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {profileQuestions.advancedTopics.map(topic => (
            <label key={topic} className="flex items-center gap-2 p-2.5 hover:bg-purple-50 rounded-lg cursor-pointer border border-transparent hover:border-purple-200 transition">
              <input type="checkbox" checked={profile.advancedTopicsInterest.includes(topic)}
                onChange={() => onArrayChange('advancedTopicsInterest', topic)}
                className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-sm text-gray-700">{topic}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiTrendingUp className="text-green-600 w-5 h-5" /> Research Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {profileQuestions.researchAreas.map(area => (
            <label key={area} className="flex items-center gap-2 p-2.5 hover:bg-green-50 rounded-lg cursor-pointer border border-transparent hover:border-green-200 transition">
              <input type="checkbox" checked={profile.researchAreas.includes(area)}
                onChange={() => onArrayChange('researchAreas', area)}
                className="w-4 h-4 text-green-600 rounded" />
              <span className="text-sm text-gray-700">{area}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiCode className="text-indigo-600 w-5 h-5" /> Programming Languages
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {profileQuestions.programmingLanguages.map(lang => (
            <label key={lang} className="flex items-center gap-2 p-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer border border-transparent hover:border-indigo-200 transition">
              <input type="checkbox" checked={profile.programmingLanguages.includes(lang)}
                onChange={() => onArrayChange('programmingLanguages', lang)}
                className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-gray-700">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiBriefcase className="text-orange-600 w-5 h-5" /> Career & Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Career Goals</label>
            <textarea
              value={profile.careerGoals}
              onChange={e => onFieldChange('careerGoals', e.target.value)}
              rows={2}
              placeholder="e.g., Software Engineer, Data Scientist, AI Researcher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Research Methodology</label>
              <select
                value={profile.researchMethodology}
                onChange={e => onFieldChange('researchMethodology', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {profileQuestions.researchMethodologies.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty Level</label>
              <select
                value={profile.difficultyLevel}
                onChange={e => onFieldChange('difficultyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {profileQuestions.difficultyLevels.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Weekly Hours Available: <span className="font-bold text-blue-600">{profile.weeklyHours}h</span>
            </label>
            <input
              type="range" min="5" max="40" step="5"
              value={profile.weeklyHours}
              onChange={e => onFieldChange('weeklyHours', parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5h</span><span>20h</span><span>40h</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
        <FiArrowLeft className="w-4 h-4" /> Πίσω
      </button>
      <div className="flex gap-3">
        <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600 transition">Παράλειψη</button>
        <button onClick={onNext} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
          {saving
            ? <><FiLoader className="w-4 h-4 animate-spin" /> Αποθήκευση...</>
            : <>Συνέχεια <FiArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </div>
  </div>
);

export default StepProfile;
