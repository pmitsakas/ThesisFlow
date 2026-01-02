import React, { useState, useEffect } from 'react';
import { dissertationAPI } from '../services/api';
import { FiUser, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';

const MyStudents = () => {
  const [dissertations, setDissertations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('assigned');

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getMyDissertations();
      setDissertations(response.data.data.filter(d => d.studentId));
      setError('');
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDissertations = dissertations.filter(d => {
    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
    
    if (selectedTrack !== 'all' && d.track !== selectedTrack) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const studentName = `${d.studentId?.name} ${d.studentId?.surname}`.toLowerCase();
      return studentName.includes(searchLower) ||
             d.title.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="mt-2 text-gray-600">Monitor and manage your students' dissertation progress</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Students"
            value={dissertations.length}
            icon={<FiUser className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Active"
            value={dissertations.filter(d => d.status === 'assigned').length}
            icon={<FiClock className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Completed"
            value={dissertations.filter(d => d.status === 'completed').length}
            icon={<FiTrendingUp className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Avg Progress"
            value={`${Math.round(dissertations.reduce((acc, d) => acc + d.progress_percentage, 0) / (dissertations.length || 1))}%`}
            icon={<FiTrendingUp className="h-6 w-6" />}
            color="indigo"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or topic..."
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
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
            <FiUser className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Yet</h3>
            <p className="text-gray-600 mb-6">You don't have any assigned students at the moment</p>
            <a
              href="/my-topics"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View My Topics
            </a>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredDissertations.length} of {dissertations.length} students
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDissertations.map((dissertation) => (
                <StudentCard
                  key={dissertation._id}
                  dissertation={dissertation}
                  getStatusColor={getStatusColor}
                  getProgressColor={getProgressColor}
                  getDaysUntilDeadline={getDaysUntilDeadline}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StudentCard = ({ dissertation, getStatusColor, getProgressColor, getDaysUntilDeadline }) => {
  const daysUntilDeadline = getDaysUntilDeadline(dissertation.deadline);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-blue-600">
                {dissertation.studentId?.name?.charAt(0)}{dissertation.studentId?.surname?.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {dissertation.studentId?.name} {dissertation.studentId?.surname}
              </h3>
              <p className="text-sm text-gray-600">{dissertation.studentId?.email}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
            {dissertation.status.toUpperCase()}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {dissertation.track}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{dissertation.title}</h4>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{dissertation.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`}
              style={{ width: `${dissertation.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {dissertation.date_started && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center">
                <FiCalendar className="mr-1" /> Started
              </p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(dissertation.date_started).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
          {dissertation.deadline && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center">
                <FiClock className="mr-1" /> Deadline
              </p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(dissertation.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              {daysUntilDeadline !== null && (
                <p className={`text-xs font-semibold mt-1 ${
                  daysUntilDeadline < 0 ? 'text-red-600' : 
                  daysUntilDeadline <= 14 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {daysUntilDeadline < 0 ? 
                    `Overdue by ${Math.abs(daysUntilDeadline)} days` : 
                    `${daysUntilDeadline} days remaining`
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <a
            href={`/dissertation/${dissertation._id}`}
            className="w-full block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default MyStudents;