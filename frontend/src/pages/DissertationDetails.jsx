import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dissertationAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';
import { fileAPI } from '../services/api';
import FileCard from '../components/FileCard';
import FileUploader from '../components/FileUploader';
import { getFileIcon } from '../utils/fileHelpers.jsx';
import { FiFile } from 'react-icons/fi';

const DissertationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dissertation, setDissertation] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');


  useEffect(() => {
    fetchDissertation();
  }, [id]);

  const fetchDissertation = async () => {
    try {
      setLoading(true);
      const res = await dissertationAPI.getById(id);
      setDissertation(res.data.data);

      if (res.data.data) {
        fetchComments(res.data.data._id);
        fetchFiles(res.data.data._id);
      }

      setError('');
    } catch (err) {
      setError('Failed to load dissertation details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (dissertationId) => {
    try {
      const response = await commentAPI.getByDissertation(dissertationId);
      setComments(response.data.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const fetchFiles = async (dissertationId) => {
    try {
      const response = await fileAPI.getByDissertation(dissertationId);
      setFiles(response.data.data);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);

    if (sortOrder === 'desc') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };


  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await commentAPI.create({
        dissertationId: dissertation._id,
        content: newComment.trim()
      });
      setNewComment('');
      fetchComments(dissertation._id);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentAPI.delete(commentId);
      fetchComments(dissertation._id);
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleUpdateProgress = async () => {
    setUpdatingProgress(true);
    try {
      await dissertationAPI.updateProgress(dissertation._id, newProgress);
      setShowProgressModal(false);
      fetchDissertation();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await dissertationAPI.updateStatus(dissertation._id, newStatus);
      setShowStatusModal(false);
      fetchDissertation();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (file, description) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      await fileAPI.upload(dissertation._id, formData);
      fetchFiles(dissertation._id);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const response = await fileAPI.download(file._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await fileAPI.delete(fileId);
      fetchFiles(dissertation._id);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete file');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800',
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

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dissertation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-red-600 text-xl mb-4">{error || 'Dissertation not found'}</div>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilDeadline = getDaysUntilDeadline(dissertation.deadline);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dissertation Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">{dissertation.title}</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {dissertation.track}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
                    {dissertation.status.toUpperCase()}
                  </span>
                </div>

                {dissertation.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{dissertation.description}</p>
                  </div>
                )}

                {dissertation.status === 'assigned' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{dissertation.progress_percentage}%</span>
                        {isTeacher && (
                          <button
                            onClick={() => {
                              setNewProgress(dissertation.progress_percentage);
                              setShowProgressModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`}
                        style={{ width: `${dissertation.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <FiUser className="mr-1" /> Supervisor
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}
                    </p>
                    <p className="text-xs text-gray-600">{dissertation.supervisorId?.email}</p>
                  </div>

                  {dissertation.studentId && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <FiUser className="mr-1" /> Student
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {dissertation.studentId?.name} {dissertation.studentId?.surname}
                      </p>
                      <p className="text-xs text-gray-600">{dissertation.studentId?.email}</p>
                    </div>
                  )}

                  {dissertation.date_started && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <FiCalendar className="mr-1" /> Started
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(dissertation.date_started).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
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
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {daysUntilDeadline !== null && (
                        <p className={`text-xs font-semibold mt-1 ${daysUntilDeadline < 0 ? 'text-red-600' :
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

                {isTeacher && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setNewStatus(dissertation.status);
                        setShowStatusModal(true);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium"
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${activeTab === 'files'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Files ({files.length})
                  </button>
                </nav>
              </div>

              {activeTab === 'comments' && (
                <div className="p-6">
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment or ask a question..."
                      rows="3"
                      maxLength="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{newComment.length}/1000</span>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No comments yet. Start the conversation!</p>
                      </div>
                    ) : (
                      sortedComments.map((comment) => (
                        <CommentCard
                          key={comment._id}
                          comment={comment}
                          currentUserId={user._id}
                          onDelete={handleDeleteComment}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="p-6">
                  <FileUploader onUpload={handleFileUpload} uploading={uploadingFile} />

                  <div className="space-y-3">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FiFile className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm">No files uploaded yet</p>
                      </div>
                    ) : (
                      files.map((file) => (
                        <FileCard
                          key={file._id}
                          file={file}
                          currentUserId={user._id}
                          onDownload={handleFileDownload}
                          onDelete={handleFileDelete}
                          getFileIcon={getFileIcon}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
                    {dissertation.status}
                  </span>
                </div>
                {dissertation.status === 'assigned' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{dissertation.progress_percentage}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="text-sm font-bold text-gray-900">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Files</span>
                  <span className="text-sm font-bold text-gray-900">{files.length}</span>
                </div>
              </div>
            </div>

            {isTeacher && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Supervisor Actions</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Update progress regularly</li>
                        <li>Provide feedback via comments</li>
                        <li>Change status as needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProgressModal && (
        <ProgressModal
          currentProgress={dissertation.progress_percentage}
          newProgress={newProgress}
          setNewProgress={setNewProgress}
          onClose={() => setShowProgressModal(false)}
          onUpdate={handleUpdateProgress}
          updating={updatingProgress}
        />
      )}

      {showStatusModal && (
        <StatusModal
          currentStatus={dissertation.status}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
          updating={updatingStatus}
        />
      )}
    </div>
  );
};

const CommentCard = ({ comment, currentUserId, onDelete }) => {
  const isOwnComment = comment.userId._id === currentUserId;

  const getRoleBadgeColor = (role) => {
    const colors = {
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'admin': 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`p-4 rounded-lg border ${isOwnComment ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">
                {comment.userId.name.charAt(0)}{comment.userId.surname.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">
              {comment.userId.name} {comment.userId.surname}
            </p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(comment.userId.role)}`}>
                {comment.userId.role}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        {isOwnComment && (
          <button
            onClick={() => onDelete(comment._id)}
            className="text-red-600 hover:text-red-800"
            title="Delete comment"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};

const ProgressModal = ({ currentProgress, newProgress, setNewProgress, onClose, onUpdate, updating }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Progress</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Progress: {currentProgress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={newProgress}
            onChange={(e) => setNewProgress(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>0%</span>
            <span className="font-bold text-lg">{newProgress}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusModal = ({ currentStatus, newStatus, setNewStatus, onClose, onUpdate, updating }) => {
  const statuses = ['assigned', 'completed', 'paused', 'canceled'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status: <span className="font-bold">{currentStatus}</span>
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            disabled={updating || newStatus === currentStatus}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DissertationDetails;