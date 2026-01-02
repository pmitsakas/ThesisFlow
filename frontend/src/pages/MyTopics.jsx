import React, { useState, useEffect } from 'react';
import { dissertationAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyTopics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dissertations, setDissertations] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const tracks = [
    'Computer Science',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Information Systems',
    'Computer Networks',
    'Human-Computer Interaction'
  ];

  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedDissertation, setSelectedDissertation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dissResponse, appsResponse] = await Promise.all([
        dissertationAPI.getMyDissertations(),
        applicationAPI.getPending()
      ]);

      setDissertations(dissResponse.data.data);
      setPendingApplications(appsResponse.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDissertations = dissertations.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    
    if (selectedTrack !== 'all' && d.track !== selectedTrack) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return d.title.toLowerCase().includes(searchLower) ||
             d.description?.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const handleViewApplications = (dissertation) => {
    setSelectedDissertation(dissertation);
    setShowApplicationsModal(true);
  };

  const handleDeleteTopic = async (dissertationId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      await dissertationAPI.delete(dissertationId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete topic');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dissertation Topics</h1>
            <p className="mt-2 text-gray-600">Manage your dissertation topics and applications</p>
          </div>
          <button
            onClick={() => navigate('/create-topic')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Topic
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {pendingApplications.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                You have {pendingApplications.length} pending application{pendingApplications.length !== 1 ? 's' : ''} to review
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Track</label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tracks</option>
                {tracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {dissertations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Topics Yet</h3>
            <p className="text-gray-600 mb-6">Create your first dissertation topic to get started</p>
            <button
              onClick={() => navigate('/create-topic')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              Create Topic
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredDissertations.length} of {dissertations.length} topics
            </div>

            <div className="space-y-4">
              {filteredDissertations.map((dissertation) => {
                const applicationsCount = pendingApplications.filter(
                  app => app.dissertationId?._id === dissertation._id
                ).length;

                return (
                  <DissertationCard
                    key={dissertation._id}
                    dissertation={dissertation}
                    applicationsCount={applicationsCount}
                    onViewApplications={() => handleViewApplications(dissertation)}
                    onDelete={() => handleDeleteTopic(dissertation._id)}
                    getStatusColor={getStatusColor}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {showApplicationsModal && selectedDissertation && (
        <ApplicationsModal
          dissertation={selectedDissertation}
          onClose={() => {
            setShowApplicationsModal(false);
            setSelectedDissertation(null);
          }}
          onSuccess={() => {
            setShowApplicationsModal(false);
            setSelectedDissertation(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const DissertationCard = ({ dissertation, applicationsCount, onViewApplications, onDelete, getStatusColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {dissertation.track}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
                {dissertation.status.toUpperCase()}
              </span>
              {applicationsCount > 0 && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {applicationsCount} pending
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{dissertation.title}</h3>
            {dissertation.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{dissertation.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
          {dissertation.studentId && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Student</p>
              <p className="text-sm font-medium text-gray-900">
                {dissertation.studentId.name} {dissertation.studentId.surname}
              </p>
            </div>
          )}
          {dissertation.status === 'assigned' && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <p className="text-sm font-medium text-gray-900">{dissertation.progress_percentage}%</p>
            </div>
          )}
          {dissertation.deadline && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(dissertation.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(dissertation.date_created).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {dissertation.status === 'available' && applicationsCount > 0 && (
            <button
              onClick={onViewApplications}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition text-sm font-medium"
            >
              View Applications ({applicationsCount})
            </button>
          )}
          {dissertation.status === 'available' && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationsModal = ({ dissertation, onClose, onSuccess }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getByDissertation(dissertation._id);
      setApplications(response.data.data.filter(app => app.status === 'pending'));
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!window.confirm('Are you sure you want to approve this application and assign the dissertation?')) return;

    try {
      await applicationAPI.approve(applicationId);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (applicationId) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;

    try {
      await applicationAPI.reject(applicationId);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to reject application');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
              <p className="text-sm text-gray-600 mt-1">{dissertation.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {application.studentId.name} {application.studentId.surname}
                      </h3>
                      <p className="text-sm text-gray-600">{application.studentId.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {application.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{application.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(application._id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      Approve & Assign
                    </button>
                    <button
                      onClick={() => handleReject(application._id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTopics;