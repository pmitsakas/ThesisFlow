import React, { useState, useEffect } from 'react';
import { dissertationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiLoader, FiInfo, FiX } from 'react-icons/fi';

const TRACK_LABELS = {
  'AI&DS': 'Artificial Intelligence & Data Science',
  'WT': 'Web Technologies',
  'BI': 'Business Informatics'
};

const ProposeTopic = () => {
  const { user, hasActiveDissertation } = useAuth();
  const studentTrack = user?.track || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tracks: studentTrack ? [studentTrack] : [],
    title: '',
    description: '',
    supervisorId: '',
    deadline: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await userAPI.getActiveTeachers();
      setTeachers(response.data.data);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateWithAI = async () => {
    setGeneratingAI(true);
    setError('');
    setSuccess('');
    try {
      const response = await userAPI.generateProposal(studentTrack);
      const aiProposal = response.data.data;
      setFormData(prev => ({
        ...prev,
        title: aiProposal.title || '',
        description: aiProposal.description || '',
        deadline: aiProposal.suggestedDeadline || ''
      }));
      setSuccess('AI proposal generated successfully! You can edit the fields before submitting.');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to generate AI proposal';
      setError(errorMessage);
      if (errorMessage.includes('profile')) {
        setTimeout(() => navigate('/student/profile'), 2000);
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        tracks: formData.tracks,
        title: formData.title,
        supervisorId: formData.supervisorId
      };
      if (formData.description?.trim()) payload.description = formData.description;
      if (formData.deadline?.trim()) payload.deadline = formData.deadline;

      await dissertationAPI.propose(payload);
      setSuccess('Proposal submitted successfully! Waiting for teacher approval.');
      setTimeout(() => navigate('/my-proposals'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    formData.tracks.length > 0 &&
    formData.title.length >= 10 &&
    formData.title.length <= 200 &&
    formData.description.length <= 3000 &&
    formData.supervisorId;

  if (hasActiveDissertation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Already Assigned</h3>
            <p className="text-yellow-700 mb-4">
              You already have an assigned dissertation. You cannot propose new topics while working on a dissertation.
            </p>
            <button
              onClick={() => navigate('/my-dissertation')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition"
            >
              View My Dissertation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Propose Dissertation Topic</h1>
          <p className="mt-2 text-gray-600">Submit your dissertation proposal to a supervisor</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
                <span className="inline-block px-4 py-2 rounded-full border-2 text-sm font-semibold bg-blue-600 border-blue-600 text-white">
                  {studentTrack} - {TRACK_LABELS[studentTrack]}
                </span>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FiZap className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-sm font-semibold text-purple-900">AI-Powered Proposal Generator</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfoModal(true)}
                    className="text-purple-400 hover:text-purple-600 transition"
                    title="How does this work?"
                  >
                    <FiInfo className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-purple-700 mb-3">
                  Let AI create a personalized dissertation proposal based on your student profile and track.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={generatingAI}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center"
                >
                  {generatingAI ? (
                    <>
                      <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <FiZap className="w-5 h-5 mr-2" />
                      Generate Proposal with AI
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength="10"
                  maxLength="200"
                  placeholder="Enter a descriptive title for your proposal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.title.length}/200 characters (minimum 10)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  maxLength="3000"
                  placeholder="Describe your proposed dissertation topic, objectives, methodology, and expected outcomes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.description.length}/3000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Supervisor <span className="text-red-500">*</span>
                </label>
                <select
                  name="supervisorId"
                  value={formData.supervisorId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a supervisor</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} {teacher.surname} - {teacher.email}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Choose the teacher you would like to supervise your dissertation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Suggest a deadline for your dissertation</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                    <div className="mt-2 text-sm text-blue-700 space-y-1">
                      <p>Your proposal will be sent to the selected supervisor for review.</p>
                      <p>If approved, the dissertation will be automatically assigned to you.</p>
                      <p>You can only have one active proposal or dissertation at a time.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FiZap className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">How AI Proposal Generation Works</h2>
              </div>
              <button
                onClick={() => { setShowInfoModal(false); setShowPrompt(false); }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Reads your student profile</h3>
                  <p className="text-sm text-gray-600">The AI uses the information from your profile, interests, skills, programming languages, research areas and career goals to understand what kind of dissertation suits you best.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Uses your track</h3>
                  <p className="text-sm text-gray-600">The proposal is tailored specifically to your track (<span className="font-semibold">{studentTrack} - {TRACK_LABELS[studentTrack]}</span>), ensuring the topic is relevant to your academic specialization.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Generates a complete proposal</h3>
                  <p className="text-sm text-gray-600">The system produces a title, a detailed description and a suggested deadline. You can edit all of these before submitting to your supervisor.</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-semibold mb-1">💡 Get better results</p>
                <p className="text-sm text-amber-700">The more complete your student profile is, the more accurate and personalized the AI proposal will be. Visit your <span className="font-semibold">Profile</span> page to update your interests, skills and research preferences.</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowPrompt(prev => !prev)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition"
                >
                  {showPrompt ? 'Hide prompt' : 'See prompt'}
                </button>
                {showPrompt && (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-mono leading-relaxed whitespace-pre-wrap">
                      {`You are an academic dissertation advisor. Based on the following student profile, generate a dissertation proposal tailored to the "${studentTrack}" track.
Student Profile:
- Interests: {interests}
- Skills: {skills}
- Programming Languages: {programmingLanguages}
- Research Areas: {researchAreas}
- Career Goals: {careerGoals}
- Preferred Methodology: {researchMethodology}
- Difficulty Level: {difficultyLevel}

Generate a JSON response with:
- title: a clear, academic dissertation title
- description: a detailed proposal (objectives, methodology, expected outcomes)
- suggestedDeadline: a realistic ISO date`}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => { setShowInfoModal(false); setShowPrompt(false); }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposeTopic;