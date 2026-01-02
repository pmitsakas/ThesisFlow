require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware');

const {
  authRoutes,
  userRoutes,
  dissertationRoutes,
  commentRoutes,
  settingsRoutes,
  applicationRoutes,
  notificationRoutes,
  fileRoutes
} = require('./routes');

const app = express();

connectDB();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dissertation Administration System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      dissertations: '/api/dissertations',
      comments: '/api/comments',
      settings: '/api/settings',
      files: '/api/files'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dissertations', dissertationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;