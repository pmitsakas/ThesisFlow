import React, { useState, useEffect } from 'react';
import { dissertationAPI } from '../services/api';
import { tw } from '../theme';
import { FiUser, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';

const TRACK_COLORS = {
  'AI&DS': 'bg-red-100 text-red-800',
  'WT':    'bg-blue-100 text-blue-800',
  'BI':    'bg-green-100 text-green-800',
};

const MyStudents = () => {
  const [dissertations, setDissertations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('assigned');

  const tracks = ['AI&DS', 'WT', 'BI'];

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getMyDissertations();
      setDissertations(response.data.data.filter(d => d.studentId));
      setError('');
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredDissertations = dissertations.filter(d => {
    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
    if (selectedTrack !== 'all' && !(d.tracks && d.tracks.includes(selectedTrack))) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const studentName = `${d.studentId?.name} ${d.studentId?.surname}`.toLowerCase();
      return studentName.includes(searchLower) || d.title.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const getStatusColor = (status) => ({
    'assigned':  'bg-[#1a237e]/10 text-[#1a237e]',
    'completed': 'bg-green-100 text-green-800',
    'paused':    'bg-yellow-100 text-yellow-800',
    'canceled':  'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-[#1565c0]';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-[#f26522]';
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">My Students</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
          <p className="mt-2 text-gray-500">Monitor and manage your students' dissertation progress</p>
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Students" value={dissertations.length} icon={<FiUser className="h-6 w-6" />} color="navy" />
          <StatCard title="Active" value={dissertations.filter(d => d.status === 'assigned').length} icon={<FiClock className="h-6 w-6" />} color="green" />
          <StatCard title="Completed" value={dissertations.filter(d => d.status === 'completed').length} icon={<FiTrendingUp className="h-6 w-6" />} color="orange" />
          <StatCard
            title="Avg Progress"
            value={`${Math.round(dissertations.reduce((acc, d) => acc + d.progress_percentage, 0) / (dissertations.length || 1))}%`}
            icon={<FiTrendingUp className="h-6 w-6" />}
            color="blue"
          />
        </div>

        <div className={`${tw.card} mb-6 p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by student name or topic..." className={tw.input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Track</label>
              <select value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)} className={tw.select}>
                <option value="all">All Tracks</option>
                {tracks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className={tw.select}>
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
          <div className={`${tw.card} p-12 text-center`}>
            <FiUser className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-[#1a237e] mb-2">No Students Yet</h3>
            <p className="text-gray-500 mb-6">You don't have any assigned students at the moment</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredDissertations.length} of {dissertations.length} students
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDissertations.map(dissertation => (
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
    navy:   'bg-[#1a237e]/10 text-[#1a237e]',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-[#f26522]/10 text-[#f26522]',
    blue:   'bg-[#1565c0]/10 text-[#1565c0]',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#1a237e]">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

const StudentCard = ({ dissertation, getStatusColor, getProgressColor, getDaysUntilDeadline }) => {
  const daysUntilDeadline = getDaysUntilDeadline(dissertation.deadline);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="bg-[#1a237e] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#1a237e]">
              {dissertation.studentId?.name?.charAt(0)}{dissertation.studentId?.surname?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{dissertation.studentId?.name} {dissertation.studentId?.surname}</h3>
            <p className="text-xs text-blue-200">{dissertation.studentId?.email}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
          {dissertation.status.toUpperCase()}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-1 mb-2">
          {dissertation.tracks?.map(t => (
            <span key={t} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${{
              'AI&DS': 'bg-red-100 text-red-800',
              'WT':    'bg-blue-100 text-blue-800',
              'BI':    'bg-green-100 text-green-800',
            }[t] || 'bg-gray-100 text-gray-700'}`}>{t}</span>
          ))}
        </div>
        <h4 className="font-semibold text-[#1a237e] text-sm line-clamp-2 mb-4">{dissertation.title}</h4>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-bold text-[#1a237e]">{dissertation.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`}
              style={{ width: `${dissertation.progress_percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 mb-4">
          {dissertation.date_started && (
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5"><FiCalendar className="w-3 h-3" /> Started</p>
              <p className="text-xs font-medium text-gray-700">{new Date(dissertation.date_started).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {dissertation.deadline && (
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5"><FiClock className="w-3 h-3" /> Deadline</p>
              <p className="text-xs font-medium text-gray-700">{new Date(dissertation.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              {daysUntilDeadline !== null && (
                <p className={`text-xs font-semibold mt-0.5 ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 14 ? 'text-[#f26522]' : 'text-green-600'}`}>
                  {daysUntilDeadline < 0 ? `Overdue by ${Math.abs(daysUntilDeadline)} days` : `${daysUntilDeadline} days remaining`}
                </p>
              )}
            </div>
          )}
        </div>

        <a href={`/dissertation/${dissertation._id}`} className={`${tw.btnPrimaryFull} py-2 text-sm text-center`}>
          View Details
        </a>
      </div>
    </div>
  );
};

export default MyStudents;