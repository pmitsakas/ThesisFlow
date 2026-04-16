import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dissertationAPI, applicationAPI, userAPI } from '../services/api';
import {
  FiArrowRight, FiArrowLeft, FiX, FiLoader, FiBookOpen,
  FiEdit3, FiUser, FiCalendar, FiCheckCircle, FiZap,
  FiSearch, FiList, FiCpu, FiCheck, FiPlus
} from 'react-icons/fi';

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT':    'bg-blue-100 text-blue-800',
  'BI':    'bg-green-100 text-green-800',
};
const trackColor = (t) => TRACK_COLORS[t] || 'bg-gray-100 text-gray-800';
const TRACKS = ['AI&DS', 'WT', 'BI'];
const TRACK_LABELS = {
  'AI&DS': 'Artificial Intelligence & Data Science',
  'WT':    'Web Technologies',
  'BI':    'Business Informatics'
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const TIER_COLORS = {
  1: { border: 'border-yellow-400', bg: 'bg-yellow-50', label: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  2: { border: 'border-blue-400',   bg: 'bg-blue-50',   label: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800'   },
  3: { border: 'border-gray-400',   bg: 'bg-gray-50',   label: 'text-gray-600',   badge: 'bg-gray-100 text-gray-700'   },
};

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

  const [dissertations, setDissertations] = useState([]);
  const [loadingDiss, setLoadingDiss] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDissertations, setSelectedDissertations] = useState([]);
  const [createdApplications, setCreatedApplications] = useState([]);
  const [submittingSelections, setSubmittingSelections] = useState(false);
  const [selectionError, setSelectionError] = useState('');

  const [tiering, setTiering] = useState({ 1: [], 2: [], 3: [] });
  const [untiered, setUntiered] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [submittingTiers, setSubmittingTiers] = useState(false);
  const [tierError, setTierError] = useState('');

  const [mode, setMode] = useState(null);
  const [proposalDone, setProposalDone] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [propForm, setPropForm] = useState({ title: '', description: '', supervisorId: '', deadline: '' });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [submittingProp, setSubmittingProp] = useState(false);
  const [propError, setPropError] = useState('');
  const teachersLoaded = useRef(false);

  const maxSelections = proposalDone ? 8 : 9;

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
      await dissertationAPI.propose({
        tracks: [selectedTrack],
        title: propForm.title,
        description: propForm.description,
        supervisorId: propForm.supervisorId,
        deadline: propForm.deadline || undefined,
      });
      setProposalDone(true);
      goToStep(4);
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

  const handleSubmitSelections = async () => {
    if (selectedDissertations.length !== maxSelections) return;
    setSubmittingSelections(true);
    setSelectionError('');
    try {
      const results = await Promise.all(
        selectedDissertations.map(d =>
          applicationAPI.create({ dissertationId: d._id })
        )
      );
      const apps = results.map((r, i) => ({
        applicationId: r.data.data._id,
        dissertation: selectedDissertations[i],
      }));
      setCreatedApplications(apps);
      setUntiered(apps);
      setTiering({ 1: [], 2: [], 3: [] });
      goToStep(5);
    } catch (err) {
      setSelectionError(err.response?.data?.error?.message || 'Failed to submit selections.');
    } finally {
      setSubmittingSelections(false);
    }
  };

  const handleDragStart = (item, fromTier) => {
    setDragItem({ item, fromTier });
  };

  const handleDrop = (toTier) => {
    if (!dragItem) return;
    const { item, fromTier } = dragItem;

    if (fromTier === toTier) { setDragItem(null); setDragOver(null); return; }

    if (toTier !== 'untiered') {
      const tierItems = tiering[toTier];
      const pos = tierItems.length + 1;
      if (pos > 3) { setDragItem(null); setDragOver(null); return; }
    }

    if (fromTier === 'untiered') {
      setUntiered(prev => prev.filter(x => x.applicationId !== item.applicationId));
    } else {
      setTiering(prev => ({ ...prev, [fromTier]: prev[fromTier].filter(x => x.applicationId !== item.applicationId) }));
    }

    if (toTier === 'untiered') {
      setUntiered(prev => [...prev, item]);
    } else {
      setTiering(prev => ({ ...prev, [toTier]: [...prev[toTier], item] }));
    }

    setDragItem(null);
    setDragOver(null);
  };

  const moveItem = (item, fromTier, toTier) => {
    if (toTier !== 'untiered' && tiering[toTier].length >= 3) return;

    if (fromTier === 'untiered') {
      setUntiered(prev => prev.filter(x => x.applicationId !== item.applicationId));
    } else {
      setTiering(prev => ({ ...prev, [fromTier]: prev[fromTier].filter(x => x.applicationId !== item.applicationId) }));
    }

    if (toTier === 'untiered') {
      setUntiered(prev => [...prev, item]);
    } else {
      setTiering(prev => ({ ...prev, [toTier]: [...prev[toTier], item] }));
    }
  };

  const isTieringComplete = () => {
    const total = tiering[1].length + tiering[2].length + tiering[3].length;
    return total === maxSelections && untiered.length === 0;
  };

  const handleSubmitTiers = async () => {
    if (!isTieringComplete()) return;
    setSubmittingTiers(true);
    setTierError('');
    try {
      const applications = [];
      [1, 2, 3].forEach(tier => {
        tiering[tier].forEach((item, idx) => {
          applications.push({ applicationId: item.applicationId, tier, position: idx + 1 });
        });
      });
      await applicationAPI.bulkTier(applications);
      await finishOnboarding('/dashboard');
    } catch (err) {
      setTierError(err.response?.data?.error?.message || 'Failed to save tiers.');
    } finally {
      setSubmittingTiers(false);
    }
  };

  const filteredDissertations = dissertations.filter(d => {
    if (!d.tracks || !d.tracks.includes(selectedTrack)) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return d.title.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s) ||
        d.code?.toLowerCase().includes(s);
    }
    return true;
  });

  const slideOut = slideDir === 'forward' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0';
  const slideIn  = slideDir === 'forward' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';
  const today    = new Date().toISOString().slice(0, 10);

  const stepVisible = (s) => currentStep === s
    ? 'translate-x-0 opacity-100'
    : currentStep > s ? slideOut : slideIn;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col transition-all duration-500 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FiBookOpen className="text-blue-600 w-5 h-5" />
          <span className="font-bold text-gray-800 text-lg">ThesisFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {[2, 3, 4, 5].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`rounded-full transition-all duration-300 ${currentStep === s ? 'w-6 h-3 bg-blue-600' : currentStep > s ? 'w-3 h-3 bg-blue-400' : 'w-3 h-3 bg-gray-300'}`} />
              {i < 3 && <div className="w-6 h-px bg-gray-300" />}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500 font-medium">
            {currentStep > 1 ? `Βήμα ${currentStep - 1} από 4` : ''}
          </span>
        </div>
        <button onClick={() => finishOnboarding('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <FiX className="w-4 h-4" /> Παράλειψη
        </button>
      </div>

      {/* Step container */}
      <div className="flex-1 overflow-hidden relative">

        {/* STEP 1 - Track */}
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(1)}`}>
          <div className="max-w-lg mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Καλώς ήρθες, {user?.name}!</h2>
              <p className="text-gray-500">Επέλεξε το track σου για να ξεκινήσεις</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {TRACKS.map(track => (
                <button key={track} type="button" onClick={() => handleSelectTrack(track)} disabled={savingTrack}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${TRACK_COLORS[track]}`}>{track}</span>
                      <p className="mt-2 font-semibold text-gray-900">{TRACK_LABELS[track]}</p>
                    </div>
                    {savingTrack ? <FiLoader className="w-5 h-5 animate-spin text-blue-500" /> : <FiArrowRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 2 - Mode selection */}
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(2)}`}>
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Πώς θέλεις να ξεκινήσεις;</h2>
              <p className="text-gray-500">Επέλεξε τον τρόπο δήλωσης εργασιών</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button type="button" onClick={() => { setMode('browse'); goToStep(4); }}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition text-left bg-white shadow-sm group">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                  <FiList className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Από υπάρχουσες εργασίες</h3>
                <p className="text-sm text-gray-500">Περιήγηση στις διαθέσιμες εργασίες και επιλογή 9 προτιμήσεων</p>
              </button>
              <button type="button" onClick={() => { setMode('ai'); handleLoadTeachers(); goToStep(3); }}
                className="p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition text-left bg-white shadow-sm group">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                  <FiCpu className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Πρόταση</h3>
                <p className="text-sm text-gray-500">Πρότεινε δική σου θεματική με AI, μετά επίλεξε 8 από τις υπάρχουσες</p>
              </button>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => goToStep(1)} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto transition">
                <FiArrowLeft className="w-4 h-4" /> Πίσω
              </button>
            </div>
          </div>
        </div>

        {/* STEP 3 - AI Proposal */}
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(3)}`}>
          <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white mb-4 shadow-lg">
                <FiEdit3 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Πρότεινε τη δική σου θεματική</h1>
              <p className="text-gray-500">Μετά θα επιλέξεις 8 ακόμα από τις υπάρχουσες εργασίες</p>
            </div>

            <form onSubmit={handlePropose} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-5">
              {propError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{propError}</div>}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Track</label>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${TRACK_COLORS[selectedTrack]}`}>
                    {selectedTrack} - {TRACK_LABELS[selectedTrack]}
                  </span>
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={handleGenerateAI} disabled={generatingAI}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${generatingAI ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm'}`}>
                    {generatingAI ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
                    {generatingAI ? 'Δημιουργία...' : 'AI'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Τίτλος <span className="text-red-500">*</span></label>
                <input type="text" value={propForm.title} onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                  maxLength={200} placeholder="π.χ. Ανάπτυξη συστήματος..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Περιγραφή <span className="text-red-500">*</span></label>
                <textarea value={propForm.description} onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                  maxLength={3000} rows={5} placeholder="Περίγραψε τι θέλεις να κάνεις..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Επιβλέπων <span className="text-red-500">*</span></label>
                  <select value={propForm.supervisorId} onChange={e => setPropForm(p => ({ ...p, supervisorId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Επέλεξε καθηγητή</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name} {t.surname}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline <span className="text-gray-400 text-xs">(προαιρετικό)</span></label>
                  <input type="date" value={propForm.deadline} min={today} onChange={e => setPropForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => goToStep(2)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
                  <FiArrowLeft className="w-4 h-4" /> Πίσω
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => finishOnboarding('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 transition">Παράλειψη</button>
                  <button type="submit" disabled={submittingProp}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {submittingProp ? <><FiLoader className="w-4 h-4 animate-spin" /> Υποβολή...</> : <><FiCheckCircle className="w-4 h-4" /> Υποβολή & Συνέχεια</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* STEP 4 - Browse & Select dissertations */}
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(4)}`}>
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg">
                <FiSearch className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {proposalDone ? 'Επίλεξε 8 ακόμα εργασίες' : 'Επίλεξε 9 εργασίες'}
              </h1>
              <p className="text-gray-500">
                {selectedDissertations.length}/{maxSelections} επιλεγμένες
                {proposalDone && <span className="ml-2 text-purple-600 font-medium">+ 1 δική σου πρόταση</span>}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Αναζήτηση..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 ${selectedDissertations.length === maxSelections ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                {selectedDissertations.length}/{maxSelections}
              </div>
            </div>

            {selectionError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{selectionError}</div>}

            {loadingDiss ? (
              <div className="flex justify-center py-20"><FiLoader className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredDissertations.map(d => {
                  const isSelected = selectedDissertations.some(x => x._id === d._id);
                  const isFull = selectedDissertations.length >= maxSelections && !isSelected;
                  return (
                    <div key={d._id} onClick={() => !isFull && toggleDissertation(d)}
                      className={`bg-white rounded-xl border-2 shadow-sm transition-all duration-200 flex flex-col cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : isFull ? 'border-gray-200 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                      <div className="p-4 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex flex-wrap gap-1">
                            {d.tracks && d.tracks.map(t => (
                              <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trackColor(t)}`}>{t}</span>
                            ))}
                          </div>
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        {d.code && <p className="text-xs text-gray-400 font-mono mb-1">{d.code}</p>}
                        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">{d.title}</h3>
                        {d.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{d.description}</p>}
                        {d.supervisorId && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FiUser className="w-3 h-3" />{d.supervisorId.name} {d.supervisorId.surname}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button onClick={() => goToStep(mode === 'ai' ? 3 : 2)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
                <FiArrowLeft className="w-4 h-4" /> Πίσω
              </button>
              <div className="flex gap-3">
                <button onClick={() => finishOnboarding('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 transition">Παράλειψη</button>
                <button onClick={handleSubmitSelections} disabled={selectedDissertations.length !== maxSelections || submittingSelections}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {submittingSelections ? <><FiLoader className="w-4 h-4 animate-spin" /> Αποθήκευση...</> : <>Συνέχεια <FiArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 5 - Drag & Drop tiering */}
        <div className={`absolute inset-0 overflow-y-auto transition-all duration-300 ease-in-out ${stepVisible(5)}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Κατάταξε τις εργασίες σου</h1>
              <p className="text-gray-500 text-sm">Σύρε κάθε εργασία στο tier που επιθυμείς. Η σειρά μέσα στο tier καθορίζει την προτεραιότητα.</p>
            </div>

            {tierError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{tierError}</div>}

            <div className="flex gap-4 min-h-[500px]">

              {/* Untiered column */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 h-full"
                  onDragOver={e => { e.preventDefault(); setDragOver('untiered'); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop('untiered')}>
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700 text-sm">Αδιάθετες</h3>
                    <p className="text-xs text-gray-400">{untiered.length} εργασίες</p>
                  </div>
                  <div className="p-2 space-y-2">
                    {untiered.map(item => (
                      <DraggableCard key={item.applicationId} item={item} fromTier="untiered"
                        onDragStart={handleDragStart} onMove={moveItem} tiering={tiering} />
                    ))}
                    {untiered.length === 0 && (
                      <p className="text-xs text-gray-300 text-center py-8">Όλες κατατάχθηκαν!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tier containers */}
              <div className="flex-1 grid grid-cols-3 gap-4">
                {[1, 2, 3].map(tier => {
                  const tc = TIER_COLORS[tier];
                  const isOver = dragOver === tier;
                  return (
                    <div key={tier}
                      className={`rounded-xl border-2 transition-all duration-200 ${tc.border} ${tc.bg} ${isOver ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(tier); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => handleDrop(tier)}>
                      <div className={`p-3 border-b ${tc.border}`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-bold text-sm ${tc.label}`}>Tier {tier}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.badge}`}>
                            {tiering[tier].length}/3
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {tier === 1 ? 'Πρώτη επιλογή' : tier === 2 ? 'Δεύτερη επιλογή' : 'Τρίτη επιλογή'}
                        </p>
                      </div>
                      <div className="p-2 space-y-2 min-h-[120px]">
                        {tiering[tier].map((item, idx) => (
                          <div key={item.applicationId} className="relative">
                            <div className="absolute -left-1 -top-1 w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                              <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                            </div>
                            <DraggableCard item={item} fromTier={tier}
                              onDragStart={handleDragStart} onMove={moveItem} tiering={tiering} />
                          </div>
                        ))}
                        {tiering[tier].length < 3 && (
                          <div className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center transition ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
                            <span className="text-xs text-gray-300">Σύρε εδώ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {isTieringComplete()
                  ? <span className="text-green-600 font-medium flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> Όλες οι εργασίες κατατάχθηκαν!</span>
                  : <span>{untiered.length} εργασίες αδιάθετες</span>
                }
              </div>
              <button onClick={handleSubmitTiers} disabled={!isTieringComplete() || submittingTiers}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submittingTiers ? <><FiLoader className="w-4 h-4 animate-spin" /> Αποθήκευση...</> : <><FiCheckCircle className="w-4 h-4" /> Ολοκλήρωση</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const DraggableCard = ({ item, fromTier, onDragStart, onMove, tiering }) => {
  const d = item.dissertation;

  const availableTargets = ['untiered', 1, 2, 3].filter(t => {
    if (t === fromTier) return false;
    if (t === 'untiered') return true;
    return tiering[t].length < 3;
  });

  return (
    <div draggable onDragStart={() => onDragStart(item, fromTier)}
      className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition select-none">
      <div className="flex flex-wrap gap-1 mb-1.5">
        {d.tracks && d.tracks.map(t => (
          <span key={t} className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${trackColor(t)}`}>{t}</span>
        ))}
      </div>
      <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5">{d.title}</p>
      {d.supervisorId && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <FiUser className="w-3 h-3" />{d.supervisorId.name} {d.supervisorId.surname}
        </p>
      )}
      {availableTargets.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {availableTargets.map(t => (
            <button key={t} type="button" onClick={() => onMove(item, fromTier, t)}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition">
              {t === 'untiered' ? '↩' : `T${t}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};