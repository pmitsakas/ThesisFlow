import React, { useState, useEffect } from 'react';
import { dissertationAPI, commentAPI, fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiFileText, FiImage, FiArchive } from 'react-icons/fi';
import FileCard from '../components/FileCard';

const MyDissertation = () => {
  const { user } = useAuth();
  const [dissertation, setDissertation] = useState(null);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('comments');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDissertation();
  }, []);

  const fetchDissertation = async () => {
    try {
      setLoading(true);
      const response = await dissertationAPI.getMyDissertations();

      if (response.data.data && response.data.data.length > 0) {
        const diss = response.data.data[0];
        setDissertation(diss);
        fetchComments(diss._id);
        fetchFiles(diss._id);
      } else {
        setDissertation(null);
      }
      setError('');
    } catch (err) {
      setError('Failed to load dissertation');
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', fileDescription);

      await fileAPI.upload(dissertation._id, formData);
      setSelectedFile(null);
      setFileDescription('');
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

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document')) {
      return <FiFileText className="w-8 h-8 text-red-500" />;
    }
    if (mimetype.includes('image')) {
      return <FiImage className="w-8 h-8 text-green-500" />;
    }
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) {
      return <FiArchive className="w-8 h-8 text-yellow-500" />;
    }
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dissertation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Dissertation</h3>
            <p className="text-gray-600 mb-6">You don't have an assigned dissertation yet.</p>
            <a
              href="/browse-topics"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Available Topics
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dissertation</h1>
          <p className="mt-2 text-gray-600">Track your progress and communicate with your supervisor</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
                    <p className="text-gray-600 text-sm">{dissertation.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                    <span className="text-sm font-bold text-gray-900">{dissertation.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`}
                      style={{ width: `${dissertation.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Supervisor</p>
                    <p className="text-sm font-medium text-gray-900">
                      {dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}
                    </p>
                    <p className="text-xs text-gray-600">{dissertation.supervisorId?.email}</p>
                  </div>

                  {dissertation.date_started && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Started</p>
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
                      <p className="text-xs text-gray-500 mb-1">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(dissertation.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <DeadlineWarning deadline={dissertation.deadline} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === 'comments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === 'files'
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Discussion</h3>
                    <button
                      onClick={toggleSortOrder}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                      <span className="text-xs font-medium">
                        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                      </span>
                    </button>
                  </div>

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
                    {sortedComments.length === 0 ? (
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
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <div className="mb-3">
                        <label className="cursor-pointer">
                          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            Select File
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, Images (max 50MB)</p>
                    </div>

                    {selectedFile && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getFileIcon(selectedFile.type)}
                            <span className="ml-2 text-sm font-medium text-gray-900">{selectedFile.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</span>
                        </div>
                        <input
                          type="text"
                          value={fileDescription}
                          onChange={(e) => setFileDescription(e.target.value)}
                          placeholder="Add a description (optional)"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          maxLength="500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleFileUpload}
                            disabled={uploadingFile}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
                          >
                            {uploadingFile ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setFileDescription('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

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
                          formatFileSize={formatFileSize}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{dissertation.progress_percentage}%</span>
                </div>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Tips for Success</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Communicate regularly with your supervisor</li>
                      <li>Upload drafts for feedback</li>
                      <li>Set weekly milestones</li>
                      <li>Ask questions early</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeadlineWarning = ({ deadline }) => {
  const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 0) {
    return <p className="text-xs text-red-600 font-semibold mt-1">Deadline passed!</p>;
  }

  if (daysUntilDeadline <= 14) {
    return <p className="text-xs text-orange-600 font-semibold mt-1">{daysUntilDeadline} days remaining</p>;
  }

  return null;
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
            <FiTrash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};


export default MyDissertation;