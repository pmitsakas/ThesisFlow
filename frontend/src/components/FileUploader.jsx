import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { getFileIcon, formatFileSize } from '../utils/fileHelpers';

const FileUploader = ({ onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

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

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, description);
    setSelectedFile(null);
    setDescription('');
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDescription('');
  };

  return (
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            maxLength="500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;