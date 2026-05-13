import React, { useState, useEffect } from 'react';
import { dissertationAPI, commentAPI, fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import { FiUpload, FiFile, FiFileText, FiImage, FiArchive, FiTrash2 } from 'react-icons/fi';
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

  useEffect(() => { fetchDissertation(); }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (dissertationId) => {
    try {
      const response = await commentAPI.getByDissertation(dissertationId);
      setComments(response.data.data);
    } catch (err) { console.error('Failed to load comments:', err); }
  };

  const fetchFiles = async (dissertationId) => {
    try {
      const response = await fileAPI.getByDissertation(dissertationId);
      setFiles(response.data.data);
    } catch (err) { console.error('Failed to load files:', err); }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await commentAPI.create({ dissertationId: dissertation._id, content: newComment.trim() });
      setNewComment('');
      fetchComments(dissertation._id);
    } catch (err) { alert(err.response?.data?.error?.message || 'Failed to post comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentAPI.delete(commentId);
      fetchComments(dissertation._id);
    } catch { alert('Failed to delete comment'); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { alert('File size must be less than 50MB'); return; }
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
    } catch (err) { alert(err.response?.data?.error?.message || 'Failed to upload file'); }
    finally { setUploadingFile(false); }
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
    } catch { alert('Failed to download file'); }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await fileAPI.delete(fileId);
      fetchFiles(dissertation._id);
    } catch (err) { alert(err.response?.data?.error?.message || 'Failed to delete file'); }
  };

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

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document'))
      return <FiFileText className="w-8 h-8 text-red-500" />;
    if (mimetype.includes('image'))
      return <FiImage className="w-8 h-8 text-green-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive'))
      return <FiArchive className="w-8 h-8 text-yellow-500" />;
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  if (!dissertation) return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className={`${tw.card} p-12 text-center`}>
          <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-[#1a237e] mb-2">No Active Dissertation</h3>
          <p className="text-gray-500">You don't have an assigned dissertation yet.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">My Dissertation</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
          <p className="mt-2 text-gray-500">Track your progress and communicate with your supervisor</p>
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <div className={`${tw.card} overflow-hidden`}>
              <div className="bg-[#1a237e] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{dissertation.title}</h2>
                <div className="w-8 h-0.5 bg-[#f26522] mt-2 rounded-full" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-wrap gap-1">
                    {dissertation.tracks && dissertation.tracks.length > 0
                      ? dissertation.tracks.map(t => (
                          <span key={t} className={`px-3 py-1 text-xs font-semibold rounded-full ${{
                            'AI&DS': 'bg-red-100 text-red-800',
                            'WT':    'bg-blue-100 text-blue-800',
                            'BI':    'bg-green-100 text-green-800',
                          }[t] || 'bg-gray-100 text-gray-800'}`}>{t}</span>
                        ))
                      : <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">No track</span>
                    }
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
                    {dissertation.status.toUpperCase()}
                  </span>
                </div>

                {dissertation.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#1a237e] mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{dissertation.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-[#1a237e]">Progress</h3>
                    <span className="text-sm font-bold text-[#1a237e]">{dissertation.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`} style={{ width: `${dissertation.progress_percentage}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Supervisor</p>
                    <p className="text-sm font-medium text-gray-900">{dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}</p>
                    <p className="text-xs text-gray-500">{dissertation.supervisorId?.email}</p>
                  </div>
                  {dissertation.date_started && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Started</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(dissertation.date_started).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                  {dissertation.deadline && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(dissertation.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <DeadlineWarning deadline={dissertation.deadline} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${tw.card} overflow-hidden`}>
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['comments', 'files'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition capitalize ${
                        activeTab === tab
                          ? 'border-[#f26522] text-[#1a237e]'
                          : 'border-transparent text-gray-500 hover:text-[#1a237e] hover:border-gray-300'
                      }`}
                    >
                      {tab === 'comments' ? `Comments (${comments.length})` : `Files (${files.length})`}
                    </button>
                  ))}
                </nav>
              </div>

              {activeTab === 'comments' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#1a237e]">Discussion</h3>
                    <button
                      onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="text-xs font-medium text-gray-500 hover:text-[#1a237e] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                      {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                  </div>

                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Write a comment or ask a question..."
                      rows={3}
                      maxLength={1000}
                      className={tw.textarea}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{newComment.length}/1000</span>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className={`${tw.btnPrimary} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {sortedComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No comments yet. Start the conversation!</p>
                      </div>
                    ) : (
                      sortedComments.map(comment => (
                        <CommentCard key={comment._id} comment={comment} currentUserId={user._id} onDelete={handleDeleteComment} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="p-6">
                  <div className="mb-6 p-4 bg-[#f5f5f5] rounded-lg border-2 border-dashed border-gray-300 hover:border-[#1a237e] transition">
                    <div className="text-center">
                      <FiUpload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <div className="mb-3">
                        <label className="cursor-pointer">
                          <span className={`${tw.btnPrimary} px-4 py-2 text-sm`}>Select File</span>
                          <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, Images (max 50MB)</p>
                    </div>

                    {selectedFile && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getFileIcon(selectedFile.type)}
                            <span className="text-sm font-medium text-gray-900">{selectedFile.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</span>
                        </div>
                        <input
                          type="text"
                          value={fileDescription}
                          onChange={e => setFileDescription(e.target.value)}
                          placeholder="Add a description (optional)"
                          className={`${tw.input} mb-2`}
                          maxLength={500}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleFileUpload} disabled={uploadingFile} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition text-sm font-medium">
                            {uploadingFile ? 'Uploading...' : 'Upload'}
                          </button>
                          <button onClick={() => { setSelectedFile(null); setFileDescription(''); }} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition text-sm font-medium">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FiFile className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm">No files uploaded yet</p>
                      </div>
                    ) : (
                      files.map(file => (
                        <FileCard key={file._id} file={file} currentUserId={user._id} onDownload={handleFileDownload} onDelete={handleFileDelete} getFileIcon={getFileIcon} formatFileSize={formatFileSize} />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className={tw.card + ' p-6'}>
              <h3 className="text-lg font-semibold text-[#1a237e] mb-1">Quick Stats</h3>
              <div className="w-6 h-0.5 bg-[#f26522] mb-4 rounded-full" />
              <div className="space-y-3">
                {[
                  { label: 'Status', value: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>{dissertation.status}</span> },
                  { label: 'Progress', value: <span className="text-sm font-bold text-[#1a237e]">{dissertation.progress_percentage}%</span> },
                  { label: 'Comments', value: <span className="text-sm font-bold text-[#1a237e]">{comments.length}</span> },
                  { label: 'Files', value: <span className="text-sm font-bold text-[#1a237e]">{files.length}</span> },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-sm text-gray-500">{row.label}</span>
                    {row.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a237e] rounded-xl p-6 text-white">
              <h3 className="text-sm font-semibold mb-1">Tips for Success</h3>
              <div className="w-6 h-0.5 bg-[#f26522] mb-3 rounded-full" />
              <ul className="text-sm text-blue-200 space-y-1.5 list-disc list-inside">
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
  );
};

const DeadlineWarning = ({ deadline }) => {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <p className="text-xs text-red-600 font-semibold mt-1">Deadline passed!</p>;
  if (days <= 14) return <p className="text-xs text-[#f26522] font-semibold mt-1">{days} days remaining</p>;
  return null;
};

const CommentCard = ({ comment, currentUserId, onDelete }) => {
  const isOwnComment = comment.userId._id === currentUserId;
  const getRoleBadgeColor = (role) => ({
    'teacher': 'bg-[#1a237e]/10 text-[#1a237e]',
    'student': 'bg-green-100 text-green-800',
    'admin':   'bg-[#f26522]/10 text-[#f26522]',
  }[role] || 'bg-gray-100 text-gray-800');

  return (
    <div className={`p-4 rounded-lg border ${isOwnComment ? 'bg-[#1a237e]/5 border-[#1a237e]/20' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#1a237e] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {comment.userId.name.charAt(0)}{comment.userId.surname.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{comment.userId.name} {comment.userId.surname}</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(comment.userId.role)}`}>
                {comment.userId.role}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        {isOwnComment && (
          <button onClick={() => onDelete(comment._id)} className="text-gray-300 hover:text-red-500 transition" title="Delete comment">
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};

export default MyDissertation;