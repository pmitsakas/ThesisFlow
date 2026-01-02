import { FiDownload, FiTrash2 } from "react-icons/fi";
import { formatFileSize } from '../utils/fileHelpers';

const FileCard = ({ file, currentUserId, onDownload, onDelete, getFileIcon }) => {
  const isOwnFile = file.uploadedBy._id === currentUserId;

  const getRoleBadgeColor = (role) => {
    const colors = {
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'admin': 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getFileIcon(file.mimetype)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{file.originalName}</p>
          {file.description && (
            <p className="text-xs text-gray-600 mt-1">{file.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {new Date(file.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(file.uploadedBy.role)}`}>
              {file.uploadedBy.name} {file.uploadedBy.surname}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(file)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Download"
          >
            <FiDownload className="w-5 h-5" />
          </button>
          {isOwnFile && (
            <button
              onClick={() => onDelete(file._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;