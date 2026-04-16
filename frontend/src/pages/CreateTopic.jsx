import React, { useState } from 'react';
import { dissertationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TRACKS = ['AI&DS', 'WT', 'BI'];

const TRACK_LABELS = {
  'AI&DS': 'Artificial Intelligence & Data Science',
  'WT': 'Web Technologies',
  'BI': 'Business Informatics'
};

const CreateTopic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    tracks: [],
    title: '',
    description: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTrack = (track) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.includes(track)
        ? prev.tracks.filter(t => t !== track)
        : [...prev.tracks, track]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        code: formData.code,
        tracks: formData.tracks,
        title: formData.title,
        description: formData.description || undefined,
        supervisorId: user._id,
        deadline: formData.deadline || undefined
      };

      await dissertationAPI.create(payload);
      navigate('/my-topics');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create dissertation topic');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.code.trim() &&
      formData.tracks.length > 0 &&
      formData.title.length >= 10;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Dissertation Topic</h1>
          <p className="mt-2 text-gray-600">Propose a new dissertation topic for students</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dissertation Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="e.g. AI2025-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for this dissertation. Must be unique across all dissertations.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracks <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {TRACKS.map(track => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition ${
                        formData.tracks.includes(track)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {track} - {TRACK_LABELS[track]}
                    </button>
                  ))}
                </div>
                {formData.tracks.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">Please select at least one track</p>
                )}
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
                  placeholder="Enter a descriptive title for the dissertation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/200 characters (minimum 10)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  maxLength="3000"
                  placeholder="Provide a detailed description of the dissertation topic, objectives, methodology, and expected outcomes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/3000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Set a deadline for this dissertation. Leave empty to use the system default.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Tips for Creating Topics</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use a clear, memorable code (e.g. AI2025-001)</li>
                        <li>Make the title clear and specific</li>
                        <li>Include research objectives and methodology in the description</li>
                        <li>Specify any prerequisites or required skills</li>
                        <li>Set realistic deadlines considering the scope</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/my-topics')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTopic;