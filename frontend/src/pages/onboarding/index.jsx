import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dissertationAPI, applicationAPI, userAPI } from '../../services/api';
import { FiX, FiBookOpen } from 'react-icons/fi';

import StepTrack    from './StepTrack';
import StepMode     from './StepMode';
import StepProfile  from './StepProfile';
import StepPropose  from './StepPropose';
import StepBrowse   from './StepBrowse';
import StepTiering  from './StepTiering';

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    if (user?.hasCompletedOnboarding) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState('forward');

  const [selectedTrack, setSelectedTrack] = useState('');
  const [savingTrack, setSavingTrack] = useState(false);

  const [mode, setMode] = useState(null);
  const [proposalDone, setProposalDone] = useState(false);
  const [proposalItem, setProposalItem] = useState(null);

  const [profile, setProfile] = useState({
    interests: [], preferredTopics: [], skills: [], programmingLanguages: [],
    careerGoals: '', previousExperience: '', researchMethodology: '',
    weeklyHours: 10, difficultyLevel: '', coreCoursesFavorites: [],
    advancedTopicsInterest: [], researchAreas: []
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [teachers, setTeachers] = useState([]);
  const [propForm, setPropForm] = useState({ title: '', description: '', supervisorId: '', deadline: '' });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submittingProp, setSubmittingProp] = useState(false);
  const [propError, setPropError] = useState('');
  const teachersLoaded = useRef(false);

  const [dissertations, setDissertations] = useState([]);
  const [loadingDiss, setLoadingDiss] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDissertations, setSelectedDissertations] = useState([]);
  const [submittingSelections, setSubmittingSelections] = useState(false);
  const [selectionError, setSelectionError] = useState('');

  const [tiering, setTiering] = useState({ 1: [], 2: [], 3: [] });
  const [untiered, setUntiered] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [submittingTiers, setSubmittingTiers] = useState(false);
  const [tierError, setTierError] = useState('');

  const maxSelections = proposalDone ? 8 : 9;
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dissertationAPI.getAvailable();
        setDissertations(res.data.data || []);
      } catch {
      } finally {
        setLoadingDiss(false);
      }
    };
    load();
  }, []);

  const finishOnboarding = async (destination = '/dashboard') => {
    try { await userAPI.completeOnboarding(); } catch { }
    await refreshUser();
    navigate(destination, { replace: true });
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
      goToStep(4);
    } catch (err) {
      setProfileError(err.response?.data?.error?.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedTrack) return;
    setGeneratingAI(true);
    setPropError('');
    try {
      const res = await userAPI.generateProposal(selectedTrack);
      const ai = res.data.data;
      setPropForm(prev => ({
        ...prev,
        title: ai.title || prev.title,
        description: ai.description || prev.description,
        deadline: ai.suggestedDeadline ? ai.suggestedDeadline.slice(0, 10) : prev.deadline,
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
        supervisorId: propForm.supervisorId,
        deadline: propForm.deadline || undefined,
      });
      const proposalDissertation = res.data.data;
      setProposalItem({
        applicationId: null,
        tempId: 'PROPOSAL-' + proposalDissertation._id,
        isProposal: true,
        dissertation: proposalDissertation,
      });
      setProposalDone(true);
      goToStep(5);
    } catch (err) {
      setPropError(err.response?.data?.error?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingProp(false);
    }
  };

  const toggleDissertation = (d) => {
    setSelectedDissertations(prev => {
      const exists = prev.find(x => x._id === d._id);
      if (exists) return prev.filter(x => x._id !== d._id);
      if (prev.length >= maxSelections) return prev;
      return [...prev, d];
    });
  };

  const handleSubmitSelections = () => {
    if (selectedDissertations.length !== maxSelections) return;
    const items = selectedDissertations.map(d => ({
      applicationId: null,
      tempId: d._id,
      dissertation: d,
    }));
    const allItems = proposalItem ? [proposalItem, ...items] : items;
    setUntiered(allItems);
    setTiering({ 1: [], 2: [], 3: [] });
    goToStep(6);
  };

  const handleDragStart = (item, fromTier) => setDragItem({ item, fromTier });

  const handleDrop = (toTier) => {
    if (!dragItem) return;
    const { item, fromTier } = dragItem;
    if (fromTier === toTier) { setDragItem(null); setDragOver(null); return; }
    if (toTier !== 'untiered' && tiering[toTier].length >= 3) { setDragItem(null); setDragOver(null); return; }

    const key = (x) => x.tempId || x.applicationId;
    if (fromTier === 'untiered') setUntiered(prev => prev.filter(x => key(x) !== key(item)));
    else setTiering(prev => ({ ...prev, [fromTier]: prev[fromTier].filter(x => key(x) !== key(item)) }));

    if (toTier === 'untiered') setUntiered(prev => [...prev, item]);
    else setTiering(prev => ({ ...prev, [toTier]: [...prev[toTier], item] }));

    setDragItem(null);
    setDragOver(null);
  };

  const moveItem = (item, fromTier, toTier) => {
    if (toTier !== 'untiered' && tiering[toTier].length >= 3) return;
    const key = (x) => x.tempId || x.applicationId;
    if (fromTier === 'untiered') setUntiered(prev => prev.filter(x => key(x) !== key(item)));
    else setTiering(prev => ({ ...prev, [fromTier]: prev[fromTier].filter(x => key(x) !== key(item)) }));
    if (toTier === 'untiered') setUntiered(prev => [...prev, item]);
    else setTiering(prev => ({ ...prev, [toTier]: [...prev[toTier], item] }));
  };

  const isTieringComplete = () => {
    const total = tiering[1].length + tiering[2].length + tiering[3].length;
    const expected = proposalItem ? maxSelections + 1 : maxSelections;
    return total === expected && untiered.length === 0;
  };

  const handleSubmitTiers = async () => {
    if (!isTieringComplete()) return;
    setSubmittingTiers(true);
    setTierError('');
    try {
      const allItems = [];
      [1, 2, 3].forEach(tier => {
        tiering[tier].forEach((item, idx) => {
          allItems.push({ ...item, tier, position: idx + 1 });
        });
      });

      const regularItems = allItems.filter(i => !i.isProposal);
      const proposalTierItem = allItems.find(i => i.isProposal);

      const regularResults = await Promise.all(
        regularItems.map(item =>
          applicationAPI.create({ dissertationId: item.dissertation._id })
        )
      );

      const regularIds = regularItems.map((item, idx) => ({
        item,
        appId: regularResults[idx].data.data._id
      }));

      let proposalAppId = null;
      if (proposalTierItem) {
        const existing = await applicationAPI.getMyApplications();
        const regularAppIds = regularIds.map(r => r.appId);
        const found = existing.data.data.find(a => !regularAppIds.includes(a._id));
        if (!found) throw new Error('Proposal application not found');
        proposalAppId = found._id;
      }

      const key = (x) => x.tempId || x.applicationId;
      const bulkPayload = allItems.map(item => ({
        applicationId: item.isProposal
          ? proposalAppId
          : regularIds.find(r => key(r.item) === key(item))?.appId,
        tier: item.tier,
        position: item.position,
      }));

      await applicationAPI.bulkTier(bulkPayload);
      await finishOnboarding('/dashboard');
    } catch (err) {
      setTierError(err.response?.data?.error?.message || 'Failed to save tiers.');
    } finally {
      setSubmittingTiers(false);
    }
  };

  const filteredByTrack = dissertations.filter(d =>
    d.tracks && d.tracks.includes(selectedTrack)
  );

  const slideOut = slideDir === 'forward' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';
  const slideIn  = slideDir === 'forward' ? 'translate-x-full opacity-0'  : '-translate-x-full opacity-0';
  const stepVisible = (s) => currentStep === s ? 'translate-x-0 opacity-100' : currentStep > s ? slideOut : slideIn;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col transition-all duration-500 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

      <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FiBookOpen className="text-blue-600 w-5 h-5" />
          <span className="font-bold text-gray-800 text-lg">ThesisFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {[2, 3, 4, 5, 6].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`rounded-full transition-all duration-300 ${currentStep === s ? 'w-6 h-3 bg-blue-600' : currentStep > s ? 'w-3 h-3 bg-blue-400' : 'w-3 h-3 bg-gray-300'}`} />
              {i < 4 && <div className="w-6 h-px bg-gray-300" />}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500 font-medium">
            {currentStep > 1 ? `Βήμα ${currentStep - 1} από 5` : ''}
          </span>
        </div>
        <button onClick={() => finishOnboarding('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <FiX className="w-4 h-4" /> Παράλειψη
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(1)}`}>
          <StepTrack userName={user?.name} onSelect={handleSelectTrack} saving={savingTrack} />
        </div>

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(2)}`}>
          <StepMode
            onBrowse={() => { setMode('browse'); goToStep(5); }}
            onAI={() => { setMode('ai'); goToStep(3); }}
            onBack={() => goToStep(1)}
          />
        </div>

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(3)}`}>
          <StepProfile
            profile={profile}
            onArrayChange={handleArrayChange}
            onFieldChange={(field, val) => setProfile(p => ({ ...p, [field]: val }))}
            onNext={handleProfileNext}
            onBack={() => goToStep(2)}
            onSkip={() => finishOnboarding('/dashboard')}
            saving={savingProfile}
            error={profileError}
          />
        </div>

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(4)}`}>
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
            onBack={() => goToStep(3)}
            onSkip={() => finishOnboarding('/dashboard')}
            today={today}
          />
        </div>

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(5)}`}>
          <StepBrowse
            dissertations={filteredByTrack}
            loading={loadingDiss}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDissertations={selectedDissertations}
            maxSelections={maxSelections}
            proposalDone={proposalDone}
            onToggle={toggleDissertation}
            onSubmit={handleSubmitSelections}
            onBack={() => goToStep(mode === 'ai' ? 4 : 2)}
            onSkip={() => finishOnboarding('/dashboard')}
            submitting={submittingSelections}
            error={selectionError}
          />
        </div>

        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(6)}`}>
          <StepTiering
            tiering={tiering}
            untiered={untiered}
            dragOver={dragOver}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={setDragOver}
            onDragLeave={() => setDragOver(null)}
            moveItem={moveItem}
            isTieringComplete={isTieringComplete}
            onSubmit={handleSubmitTiers}
            submitting={submittingTiers}
            error={tierError}
          />
        </div>

      </div>
    </div>
  );
}
