import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { 
  FiUser, 
  FiCode, 
  FiTarget, 
  FiBriefcase, 
  FiClock,
  FiTrendingUp,
  FiSave,
  FiLoader,
  FiBookOpen,
  FiCheckCircle // Προσθήκη εικονιδίου για το Toast
} from 'react-icons/fi';
import profileQuestions from '../../config/profileQuestions.json';

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    interests: [],
    preferredTopics: [],
    skills: [],
    programmingLanguages: [],
    careerGoals: '',
    previousExperience: '',
    researchMethodology: '',
    weeklyHours: 10,
    difficultyLevel: '',
    coreCoursesFavorites: [],
    advancedTopicsInterest: [],
    researchAreas: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMyProfile();
      
      if (response.data.data.studentProfile) {
        setProfile({
          interests: response.data.data.studentProfile.interests || [],
          preferredTopics: response.data.data.studentProfile.preferredTopics || [],
          skills: response.data.data.studentProfile.skills || [],
          programmingLanguages: response.data.data.studentProfile.programmingLanguages || [],
          careerGoals: response.data.data.studentProfile.careerGoals || '',
          previousExperience: response.data.data.studentProfile.previousExperience || '',
          researchMethodology: response.data.data.studentProfile.researchMethodology || '',
          weeklyHours: response.data.data.studentProfile.weeklyHours || 10,
          difficultyLevel: response.data.data.studentProfile.difficultyLevel || '',
          coreCoursesFavorites: response.data.data.studentProfile.coreCoursesFavorites || [],
          advancedTopicsInterest: response.data.data.studentProfile.advancedTopicsInterest || [],
          researchAreas: response.data.data.studentProfile.researchAreas || []
        });
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await userAPI.updateMyProfile({ studentProfile: profile });

      // Το μήνυμα θα εμφανιστεί στο Toast
      setSuccess('Profile updated successfully!');
      
      // Εξαφάνιση μετά από 4 δευτερόλεπτα
      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiUser className="text-blue-600" />
          Student Academic Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Complete your academic profile to receive AI-powered personalized dissertation topic suggestions based on your interests and the curriculum
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* ΣΗΜΕΙΩΣΗ: Αφαιρέθηκε το στατικό success message από εδώ */}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBookOpen className="text-blue-600" />
            Favorite Core Courses
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the courses you enjoyed most or found most interesting from your core curriculum
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profileQuestions.coreCourses.map(course => (
              <label key={course} className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded cursor-pointer border border-transparent hover:border-blue-200 transition-colors">
                <input
                  type="checkbox"
                  checked={profile.coreCoursesFavorites.includes(course)}
                  onChange={() => handleArrayChange('coreCoursesFavorites', course)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{course}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTarget className="text-blue-600" />
            Advanced Topics & Specializations
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Which advanced topics would you like to explore in your dissertation?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profileQuestions.advancedTopics.map(topic => (
              <label key={topic} className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded cursor-pointer border border-transparent hover:border-purple-200 transition-colors">
                <input
                  type="checkbox"
                  checked={profile.advancedTopicsInterest.includes(topic)}
                  onChange={() => handleArrayChange('advancedTopicsInterest', topic)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" />
            Research Areas of Interest
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            What type of research would you prefer for your dissertation?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {profileQuestions.researchAreas.map(area => (
              <label key={area} className="flex items-center gap-2 p-3 hover:bg-green-50 rounded cursor-pointer border border-transparent hover:border-green-200 transition-colors">
                <input
                  type="checkbox"
                  checked={profile.researchAreas.includes(area)}
                  onChange={() => handleArrayChange('researchAreas', area)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* --- Section for General Interests --- */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTarget className="text-blue-600" />
            General Academic Interests
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add general academic interests (e.g., Artificial Intelligence, Cloud Computing). 
            Press <span className="font-bold">Enter</span> to add.
          </p>
          
          <input
            type="text"
            placeholder="Type an interest and press Enter..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value && !profile.interests.includes(value)) {
                  handleInputChange('interests', [...profile.interests, value]);
                  e.target.value = '';
                }
              }
            }}
          />
          
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.interests.map(interest => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleInputChange('interests', profile.interests.filter(i => i !== interest))}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiCode className="text-blue-600" />
            Programming Languages & Technical Skills
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Programming Languages (Proficient)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {profileQuestions.programmingLanguages.map(lang => (
                  <label key={lang} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.programmingLanguages.includes(lang)}
                      onChange={() => handleArrayChange('programmingLanguages', lang)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Technical Skills & Expertise
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profileQuestions.technicalSkills.map(skill => (
                  <label key={skill} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.skills.includes(skill)}
                      onChange={() => handleArrayChange('skills', skill)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Topics of Interest
                <span className="text-xs text-gray-500 ml-2">(Press Enter to add custom topics)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Blockchain, IoT, Quantum Computing..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (value && !profile.preferredTopics.includes(value)) {
                      handleInputChange('preferredTopics', [...profile.preferredTopics, value]);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.preferredTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleInputChange('preferredTopics', profile.preferredTopics.filter(t => t !== topic))}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiBriefcase className="text-blue-600" />
            Career Goals & Experience
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Goals & Aspirations
              </label>
              <textarea
                value={profile.careerGoals}
                onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                placeholder="What are your career aspirations? (e.g., Software Engineer, Data Scientist, AI Researcher, Cybersecurity Expert, Startup Founder, Academic Researcher...)"
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Projects & Experience
              </label>
              <textarea
                value={profile.previousExperience}
                onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                placeholder="Describe any relevant projects, internships, hackathons, or work experience you've had during your studies..."
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" />
            Dissertation Preferences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Methodology Preference
              </label>
              <select
                value={profile.researchMethodology}
                onChange={(e) => handleInputChange('researchMethodology', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select methodology</option>
                {profileQuestions.researchMethodologies.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Level Preference
              </label>
              <select
                value={profile.difficultyLevel}
                onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select difficulty level</option>
                {profileQuestions.difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiClock />
                Available Hours per Week for Dissertation: <span className="font-bold text-blue-600">{profile.weeklyHours} hours</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={profile.weeklyHours}
                onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 hrs/week</span>
                <span>20 hrs/week</span>
                <span>40 hrs/week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <FiSave />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> The more detailed your profile, the better AI-generated dissertation proposals you'll receive!
        </p>
      </div>

      {/* --- Android Style Toast Notification --- */}
      {success && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce-in transition-all duration-300 border border-gray-700">
          <FiCheckCircle className="text-green-400 text-xl" />
          <span className="font-medium text-sm md:text-base">{success}</span>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;