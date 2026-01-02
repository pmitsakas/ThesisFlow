const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileController } = require('../controllers');
const { protect } = require('../middleware');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'dissertations');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dissertationDir = path.join(UPLOAD_DIR, req.params.dissertationId);
    if (!fs.existsSync(dissertationDir)) {
      fs.mkdirSync(dissertationDir, { recursive: true });
    }
    cb(null, dissertationDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.get(
  '/dissertation/:dissertationId',
  protect,
  fileController.getFilesByDissertation
);

router.post(
  '/dissertation/:dissertationId',
  protect,
  upload.single('file'),
  fileController.uploadFile
);

router.get(
  '/download/:fileId',
  protect,
  fileController.downloadFile
);

router.delete(
  '/:fileId',
  protect,
  fileController.deleteFile
);

module.exports = router;