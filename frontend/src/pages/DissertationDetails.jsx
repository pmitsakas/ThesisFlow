import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dissertationAPI, commentAPI, fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import { FiArrowLeft, FiUser, FiClock, FiCalendar, FiFile, FiTrash2 } from 'react-icons/fi';
import FileCard from '../components/FileCard';
import FileUploader from '../components/FileUploader';
import { getFileIcon } from '../utils/fileHelpers.jsx';


const DissertationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dissertation, setDissertation] = useState(null);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => { fetchDissertation(); }, [id]);

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

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

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

  const handleUpdateProgress = async () => {
    setUpdatingProgress(true);
    try {
      await dissertationAPI.updateProgress(dissertation._id, newProgress);
      setShowProgressModal(false);
      fetchDissertation();
    } catch (err) { alert(err.response?.data?.error?.message || 'Failed to update progress'); }
    finally { setUpdatingProgress(false); }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await dissertationAPI.updateStatus(dissertation._id, newStatus);
      setShowStatusModal(false);
      fetchDissertation();
    } catch (err) { alert(err.response?.data?.error?.message || 'Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const handleFileUpload = async (file, description) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      await fileAPI.upload(dissertation._id, formData);
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

  const isTeacher = user?.role === 'teacher';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  if (error || !dissertation) return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className={`${tw.card} p-12 text-center`}>
          <div className="text-red-600 text-xl mb-4">{error || 'Dissertation not found'}</div>
          <button onClick={() => navigate(-1)} className={`${tw.btnPrimary} px-6 py-2 text-sm`}>Go Back</button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1a237e] hover:text-[#f26522] mb-6 transition text-sm font-medium">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">Dissertation Details</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
        </div>

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
                    {dissertation.tracks?.map(t => (
                      <span key={t} className={`px-3 py-1 text-xs font-semibold rounded-full ${{
                        'AI&DS': 'bg-red-100 text-red-800',
                        'WT':    'bg-blue-100 text-blue-800',
                        'BI':    'bg-green-100 text-green-800',
                      }[t] || 'bg-gray-100 text-gray-800'}`}>{t}</span>
                    ))}
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(dissertation.status)}`}>
                    {dissertation.status.toUpperCase()}
                  </span>
                </div>

                {dissertation.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#1a237e] mb-2">Description</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{dissertation.description}</p>
                  </div>
                )}

                {dissertation.status === 'assigned' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-[#1a237e]">Progress</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1a237e]">{dissertation.progress_percentage}%</span>
                        {isTeacher && (
                          <button
                            onClick={() => { setNewProgress(dissertation.progress_percentage); setShowProgressModal(true); }}
                            className="text-xs text-[#f26522] hover:text-[#d4541a] font-semibold transition"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-full ${getProgressColor(dissertation.progress_percentage)} transition-all duration-500`} style={{ width: `${dissertation.progress_percentage}%` }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiUser className="w-3 h-3" /> Supervisor</p>
                    <p className="text-sm font-medium text-gray-900">{dissertation.supervisorId?.name} {dissertation.supervisorId?.surname}</p>
                    <p className="text-xs text-gray-500">{dissertation.supervisorId?.email}</p>
                  </div>
                  {dissertation.studentId && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiUser className="w-3 h-3" /> Student</p>
                      <p className="text-sm font-medium text-gray-900">{dissertation.studentId?.name} {dissertation.studentId?.surname}</p>
                      <p className="text-xs text-gray-500">{dissertation.studentId?.email}</p>
                    </div>
                  )}
                  {dissertation.date_started && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Started</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(dissertation.date_started).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>

                {isTeacher && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => { setNewStatus(dissertation.status); setShowStatusModal(true); }}
                      className={`${tw.btnPrimary} w-full py-2 text-sm`}
                    >
                      Update Status
                    </button>
                  </div>
                )}
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
                      <button type="submit" disabled={!newComment.trim() || submittingComment} className={`${tw.btnPrimary} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
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
                  <FileUploader onUpload={handleFileUpload} uploading={uploadingFile} />
                  <div className="space-y-3 mt-4">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FiFile className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm">No files uploaded yet</p>
                      </div>
                    ) : (
                      files.map(file => (
                        <FileCard key={file._id} file={file} currentUserId={user._id} onDownload={handleFileDownload} onDelete={handleFileDelete} getFileIcon={getFileIcon} />
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
                  ...(dissertation.status === 'assigned' ? [{ label: 'Progress', value: <span className="text-sm font-bold text-[#1a237e]">{dissertation.progress_percentage}%</span> }] : []),
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

            {isTeacher && (
              <div className="bg-[#1a237e] rounded-xl p-6 text-white">
                <h3 className="text-sm font-semibold mb-1">Supervisor Actions</h3>
                <div className="w-6 h-0.5 bg-[#f26522] mb-3 rounded-full" />
                <ul className="text-sm text-blue-200 space-y-1.5 list-disc list-inside">
                  <li>Update progress regularly</li>
                  <li>Provide feedback via comments</li>
                  <li>Change status as needed</li>
                </ul>
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

const ProgressModal = ({ currentProgress, newProgress, setNewProgress, onClose, onUpdate, updating }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
      <div className="bg-[#1a237e] px-6 py-4">
        <h2 className="text-lg font-bold text-white">Update Progress</h2>
        <div className="w-6 h-0.5 bg-[#f26522] mt-1 rounded-full" />
      </div>
      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Current Progress: <span className="font-bold text-[#1a237e]">{currentProgress}%</span>
        </label>
        <input
          type="range" min="0" max="100" value={newProgress}
          onChange={e => setNewProgress(parseInt(e.target.value))}
          className="w-full accent-[#1a237e]"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="font-bold text-lg text-[#1a237e]">{newProgress}%</span>
          <span>100%</span>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`${tw.btnOutline} flex-1 py-2 text-sm`}>Cancel</button>
          <button onClick={onUpdate} disabled={updating} className={`${tw.btnPrimary} flex-1 py-2 text-sm disabled:opacity-50`}>
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatusModal = ({ currentStatus, newStatus, setNewStatus, onClose, onUpdate, updating }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
      <div className="bg-[#1a237e] px-6 py-4">
        <h2 className="text-lg font-bold text-white">Update Status</h2>
        <div className="w-6 h-0.5 bg-[#f26522] mt-1 rounded-full" />
      </div>
      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Status: <span className="font-bold text-[#1a237e]">{currentStatus}</span>
        </label>
        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={tw.select}>
          {['assigned', 'completed', 'paused', 'canceled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`${tw.btnOutline} flex-1 py-2 text-sm`}>Cancel</button>
          <button onClick={onUpdate} disabled={updating || newStatus === currentStatus} className={`${tw.btnPrimary} flex-1 py-2 text-sm disabled:opacity-50`}>
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DissertationDetails;