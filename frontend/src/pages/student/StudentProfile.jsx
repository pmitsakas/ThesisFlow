import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { FiUser, FiSave, FiLoader, FiCheckCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import profileQuestions from '../../config/profileQuestions.json';

const INTERESTS = profileQuestions.advancedTopics;
const LANGUAGES = profileQuestions.programmingLanguages;
const MAX_INTERESTS = 5;

const SUB_STEPS = [
  { id: 1, title: 'What interests you?', subtitle: 'Select up to 5 topics you are most interested in' },
  { id: 2, title: 'Tools & Languages', subtitle: 'What tools do you know and at what level?' },
  { id: 3, title: 'Work style', subtitle: 'What type of project do you prefer?' },
  { id: 4, title: 'Goals', subtitle: 'Optional - helps the AI generate a better proposal for you' },
];

const PROJECT_STYLES = [
  { value: 'theoretical', icon: '📚', title: 'Research',  desc: 'Theoretical analysis, papers, algorithms' },
  { value: 'practical',   icon: '⚙️', title: 'Practical', desc: 'Software development, system implementation' },
  { value: 'mixed',       icon: '🔀', title: 'Hybrid',    desc: 'Combination of theory and practice' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Based on existing course knowledge' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Exploring new technologies' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Cutting-edge research & innovation' },
];

const Chip = ({ label, selected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
      selected
        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
        : disabled
        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:text-blue-600'
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
        className={`rounded-full transition-all duration-300 ${
          i + 1 === current ? 'w-6 h-2 bg-blue-600' :
          i + 1 < current  ? 'w-2 h-2 bg-blue-300' :
                             'w-2 h-2 bg-gray-200'
        }`}
      />
    ))}
  </div>
);

const StudentProfile = () => {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [subStep, setSubStep]   = useState(1);

  const [profile, setProfile] = useState({
    advancedTopicsInterest: [],
    programmingLanguages: [],
    difficultyLevel: '',
    researchMethodology: '',
    careerGoals: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getMyProfile();
        const sp = res.data.data.studentProfile;
        if (sp) {
          setProfile({
            advancedTopicsInterest: sp.advancedTopicsInterest || [],
            programmingLanguages:   sp.programmingLanguages   || [],
            difficultyLevel:        sp.difficultyLevel        || '',
            researchMethodology:    sp.researchMethodology    || '',
            careerGoals:            sp.careerGoals            || '',
          });
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleArray = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(i => i !== value)
        : [...prev[field], value]
    }));
  };

  const setField = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await userAPI.updateMyProfile({ studentProfile: profile });
      setSuccess('Profile saved!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = subStep === SUB_STEPS.length;
  const interestsMax = profile.advancedTopicsInterest.length >= MAX_INTERESTS;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 relative">
      <div className="mb-6 flex items-center gap-3">
        <FiUser className="text-blue-600 w-7 h-7" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Update your profile for better AI proposals</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <SubStepDots total={SUB_STEPS.length} current={subStep} />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{SUB_STEPS[subStep - 1].title}</h2>
        <p className="text-gray-500 text-sm">{SUB_STEPS[subStep - 1].subtitle}</p>
      </div>

      {subStep === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Selected: {profile.advancedTopicsInterest.length}/{MAX_INTERESTS}</span>
            {profile.advancedTopicsInterest.length > 0 && (
              <button type="button" onClick={() => setField('advancedTopicsInterest', [])} className="text-xs text-red-500 hover:text-red-700">
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
                onClick={() => toggleArray('advancedTopicsInterest', interest)}
                disabled={interestsMax}
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
                  onClick={() => toggleArray('programmingLanguages', lang)}
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
                  onClick={() => setField('difficultyLevel', opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    profile.difficultyLevel === opt.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <p className={`font-semibold text-sm ${profile.difficultyLevel === opt.value ? 'text-blue-700' : 'text-gray-800'}`}>{opt.label}</p>
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
              onClick={() => setField('researchMethodology', style.value)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-150 flex items-center gap-4 ${
                profile.researchMethodology === style.value
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <span className="text-3xl">{style.icon}</span>
              <div>
                <p className={`font-semibold text-base ${profile.researchMethodology === style.value ? 'text-blue-700' : 'text-gray-800'}`}>{style.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{style.desc}</p>
              </div>
              {profile.researchMethodology === style.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
            onChange={e => setField('careerGoals', e.target.value)}
            rows={5}
            placeholder="e.g. Software Engineer, Data Scientist, AI Researcher..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={() => setSubStep(s => s - 1)}
          disabled={subStep === 1}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition disabled:opacity-0"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
          >
            {saving ? <><FiLoader className="w-4 h-4 animate-spin" /> Saving...</> : <><FiSave className="w-4 h-4" /> Save</>}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubStep(s => s + 1)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition"
          >
            Continue <FiArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {success && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-gray-700">
          <FiCheckCircle className="text-green-400 text-xl" />
          <span className="font-medium text-sm">{success}</span>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;