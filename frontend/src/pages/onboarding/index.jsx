import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dissertationAPI, userAPI } from '../../services/api';
import { FiBookOpen } from 'react-icons/fi';

import StepTrack from './StepTrack';
import StepProfile from './StepProfile';
import StepPropose from './StepPropose';

const STORAGE_KEY = 'onboarding_state';

const defaultProfile = {
  interests: [], preferredTopics: [], skills: [], programmingLanguages: [],
  careerGoals: '', previousExperience: '', researchMethodology: '',
  weeklyHours: 10, difficultyLevel: '', coreCoursesFavorites: [],
  advancedTopicsInterest: [], researchAreas: []
};

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearSaved = () => localStorage.removeItem(STORAGE_KEY);

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    if (user?.hasCompletedOnboarding) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const saved = useRef(loadSaved());

  const [currentStep, setCurrentStep] = useState(saved.current?.currentStep || 1);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState('forward');

  const [selectedTrack, setSelectedTrack] = useState(saved.current?.selectedTrack || user?.track || '');
  const [savingTrack, setSavingTrack] = useState(false);

  const [profile, setProfile] = useState(saved.current?.profile || defaultProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [teachers, setTeachers] = useState([]);
  const [propForm, setPropForm] = useState(saved.current?.propForm || { title: '', description: '', supervisorId: '' });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submittingProp, setSubmittingProp] = useState(false);
  const [propError, setPropError] = useState('');
  const [submittedProposals, setSubmittedProposals] = useState(saved.current?.submittedProposals || []);
  const teachersLoaded = useRef(false);

  useEffect(() => {
    const state = { currentStep, selectedTrack, profile, propForm, submittedProposals };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentStep, selectedTrack, profile, propForm, submittedProposals]);

  useEffect(() => {
    if (currentStep === 3) handleLoadTeachers();
  }, [currentStep]);

  const finishOnboarding = async () => {
    clearSaved();
    try { await userAPI.completeOnboarding(); } catch { }
    await refreshUser();
    navigate('/dashboard', { replace: true });
  };

  const goToStep = (step) => {
    if (animating) return;
    setSlideDir(step > currentStep ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => { setCurrentStep(step); setAnimating(false); }, 320);
  };

  const handleSelectTrack = async (track) => {
    setSavingTrack(true);
    try {
      await userAPI.updateMyProfile({ track });
      setSelectedTrack(track);
      goToStep(2);
    } catch {
    } finally {
      setSavingTrack(false);
    }
  };

  const handleLoadTeachers = async () => {
    if (!teachersLoaded.current) {
      try {
        const res = await userAPI.getActiveTeachers();
        setTeachers(res.data.data || []);
        teachersLoaded.current = true;
      } catch { }
    }
  };

  const handleArrayChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleProfileNext = async () => {
    setSavingProfile(true);
    setProfileError('');
    try {
      await userAPI.updateMyProfile({ studentProfile: profile });
      await handleLoadTeachers();
      goToStep(3);
    } catch (err) {
      setProfileError(err.response?.data?.error?.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setPropError('');
    try {
      const res = await userAPI.generateProposal(selectedTrack);
      const ai = res.data.data;
      setPropForm(prev => ({
        ...prev,
        title: ai.title || prev.title,
        description: ai.description || prev.description,
      }));
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to generate proposal.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!propForm.title || !propForm.description || !propForm.supervisorId) {
      setPropError('Please fill in title, description and supervisor.');
      return;
    }
    setSubmittingProp(true);
    setPropError('');
    try {
      const res = await dissertationAPI.propose({
        tracks: [selectedTrack],
        title: propForm.title,
        description: propForm.description,
        supervisorId: propForm.supervisorId
      });
      setSubmittedProposals(prev => [...prev, res.data.data]);
      setPropForm({ title: '', description: '', supervisorId: '' });
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingProp(false);
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await dissertationAPI.withdrawProposal(id);
      setSubmittedProposals(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Withdraw error:', err);
    }
  };

  const slideOut = slideDir === 'forward' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';
  const slideIn = slideDir === 'forward' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';
  const stepVisible = (s) => currentStep === s ? 'translate-x-0 opacity-100' : currentStep > s ? slideOut : slideIn;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col transition-all duration-500 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

      <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`rounded-full transition-all duration-300 ${currentStep === s ? 'w-6 h-3 bg-blue-600' : currentStep > s ? 'w-3 h-3 bg-blue-400' : 'w-3 h-3 bg-gray-300'}`} />
              {i < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500 font-medium">
            Step {currentStep} from 3
          </span>
        </div>
        <div />
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(1)}`}>
          <StepTrack userName={user?.name} onSelect={handleSelectTrack} saving={savingTrack} />
        </div>
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(2)}`}>
          <StepProfile
            profile={profile}
            onArrayChange={handleArrayChange}
            onFieldChange={(field, val) => setProfile(p => ({ ...p, [field]: val }))}
            onNext={handleProfileNext}
            onBack={() => goToStep(1)}
            saving={savingProfile}
            error={profileError}
          />
        </div>
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(3)}`}>
          <StepPropose
            selectedTrack={selectedTrack}
            profile={profile}
            propForm={propForm}
            setPropForm={setPropForm}
            teachers={teachers}
            generatingAI={generatingAI}
            submittingProp={submittingProp}
            propError={propError}
            onGenerate={handleGenerateAI}
            onSubmit={handlePropose}
            onBack={() => goToStep(2)}
            onFinish={finishOnboarding}
            submittedProposals={submittedProposals}
            onWithdraw={handleWithdraw}
          />
        </div>
      </div>
    </div>
  );
}