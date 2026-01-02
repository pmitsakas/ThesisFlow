import { FiFile, FiFileText, FiImage, FiArchive } from 'react-icons/fi';

export const getFileIcon = (mimetype) => {
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

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};