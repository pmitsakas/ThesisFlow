import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft, FiLoader } from 'react-icons/fi';
import profileQuestions from '../../config/profileQuestions.json';

const INTERESTS = profileQuestions.advancedTopics;
const LANGUAGES = profileQuestions.programmingLanguages;
const MAX_INTERESTS = 5;

const SUB_STEPS = [
  { id: 1, title: 'What interests you?', subtitle: 'Select up to 5 topics you are most interested in' },
  { id: 2, title: 'Tools & Languages', subtitle: 'What tools do you know and at what level?' },
  { id: 3, title: 'Work style', subtitle: 'What type of project do you prefer?' },
  { id: 4, title: 'A bit about you', subtitle: 'Optional - helps the AI generate a better proposal for you' },
];

const Chip = ({ label, selected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${selected
      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
      : disabled
        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600'
      }`}
  >
    {label}
  </button>
);

const SubStepDots = ({ total, current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${i + 1 === current ? 'w-6 h-2 bg-purple-600' :
          i + 1 < current ? 'w-2 h-2 bg-purple-300' :
            'w-2 h-2 bg-gray-200'
          }`}
      />
    ))}
  </div>
);

const PROJECT_STYLES = [
  { value: 'theoretical', icon: '📚', title: 'Research', desc: 'Theoretical analysis, papers, algorithms' },
  { value: 'practical', icon: '⚙️', title: 'Practical', desc: 'Software development, system implementation' },
  { value: 'mixed', icon: '🔀', title: 'Hybrid', desc: 'Combination of theory and practice' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'Based on existing course knowledge' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Exploring new technologies' },
  { value: 'advanced', label: 'Advanced', desc: 'Cutting-edge research & innovation' },
];

export default function StepProfile({ profile, onArrayChange, onFieldChange, onNext, onBack, saving, error }) {
  const [subStep, setSubStep] = useState(1);

  const goNext = () => {
    if (subStep < SUB_STEPS.length) setSubStep(s => s + 1);
    else onNext();
  };

  const goPrev = () => {
    if (subStep > 1) setSubStep(s => s - 1);
    else onBack();
  };

  const interestsReachedMax = profile.advancedTopicsInterest.length >= MAX_INTERESTS;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SubStepDots total={SUB_STEPS.length} current={subStep} />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{SUB_STEPS[subStep - 1].title}</h1>
        <p className="text-gray-500">{SUB_STEPS[subStep - 1].subtitle}</p>
      </div>

      {error && subStep === SUB_STEPS.length && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {subStep === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Selected : {profile.advancedTopicsInterest.length}/{MAX_INTERESTS}</span>
            {profile.advancedTopicsInterest.length > 0 && (
              <button
                type="button"
                onClick={() => profile.advancedTopicsInterest.forEach(i => onArrayChange('advancedTopicsInterest', i))}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <Chip
                key={interest}
                label={interest}
                selected={profile.advancedTopicsInterest.includes(interest)}
                onClick={() => onArrayChange('advancedTopicsInterest', interest)}
                disabled={interestsReachedMax}
              />
            ))}
          </div>
        </div>
      )}

      {subStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Programming languages</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <Chip
                  key={lang}
                  label={lang}
                  selected={profile.programmingLanguages.includes(lang)}
                  onClick={() => onArrayChange('programmingLanguages', lang)}
                />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Knowledge level</h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFieldChange('difficultyLevel', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${profile.difficultyLevel === opt.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <p className={`font-semibold text-sm ${profile.difficultyLevel === opt.value ? 'text-purple-700' : 'text-gray-800'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subStep === 3 && (
        <div className="space-y-4">
          {PROJECT_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => onFieldChange('researchMethodology', style.value)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-150 flex items-center gap-4 ${profile.researchMethodology === style.value
                ? 'border-purple-600 bg-purple-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
            >
              <span className="text-3xl">{style.icon}</span>
              <div>
                <p className={`font-semibold text-base ${profile.researchMethodology === style.value ? 'text-purple-700' : 'text-gray-800'}`}>
                  {style.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{style.desc}</p>
              </div>
              {profile.researchMethodology === style.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {subStep === 4 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goals</label>
          <textarea
            value={profile.careerGoals}
            onChange={e => onFieldChange('careerGoals', e.target.value)}
            rows={5}
            placeholder="e.g. Software Engineer, Data Scientist, AI Researcher..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={goPrev}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={saving && subStep === SUB_STEPS.length}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          {saving && subStep === SUB_STEPS.length
            ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving...</>
            : subStep === SUB_STEPS.length
              ? <>Save <FiArrowRight className="w-4 h-4" /></>
              : <>Continue <FiArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </div>
  );
}