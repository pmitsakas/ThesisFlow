const File = require('../models/File');
const Dissertation = require('../models/Dissertation');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'dissertations');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.getFilesByDissertation = async (req, res) => {
  try {
    const { dissertationId } = req.params;

    const dissertation = await Dissertation.findById(dissertationId);

    if (!dissertation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();
    const isStudent = dissertation.studentId && dissertation.studentId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor && !isStudent) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to view these files'
        }
      });
    }

    const files = await File.findByDissertation(dissertationId);

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching files'
      }
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const { dissertationId } = req.params;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    const dissertation = await Dissertation.findById(dissertationId);

    if (!dissertation) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        error: {
          code: 'DISSERTATION_NOT_FOUND',
          message: 'Dissertation not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();
    const isStudent = dissertation.studentId && dissertation.studentId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor && !isStudent) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to upload files'
        }
      });
    }

    const file = await File.create({
      dissertationId,
      uploadedBy: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      description: description || ''
    });

    const populatedFile = await File.findById(file._id)
      .populate('uploadedBy', 'name surname role');

    res.status(201).json({
      success: true,
      data: populatedFile
    });

  } catch (error) {
    console.error('Upload file error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while uploading file'
      }
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }

    const dissertation = await Dissertation.findById(file.dissertationId);

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isSupervisor = dissertation.supervisorId.toString() === userId.toString();
    const isStudent = dissertation.studentId && dissertation.studentId.toString() === userId.toString();

    if (!isAdmin && !isSupervisor && !isStudent) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to download this file'
        }
      });
    }

    const filePath = path.join(UPLOAD_DIR, file.dissertationId.toString(), file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found on server'
        }
      });
    }

    res.download(filePath, file.originalName);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while downloading file'
      }
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const isUploader = file.uploadedBy.toString() === userId.toString();

    if (!isAdmin && !isUploader) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only delete your own files'
        }
      });
    }

    const filePath = path.join(UPLOAD_DIR, file.dissertationId.toString(), file.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting file'
      }
    });
  }
};