const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dissertationRoutes = require('./Dissertation.routes');
const commentRoutes = require('./comment.routes');
const settingsRoutes = require('./settings.routes');
const applicationRoutes = require('./application.routes');
const notificationRoutes = require('./notification.routes');
const fileRoutes = require('./file.routes');

module.exports = {
  authRoutes,
  userRoutes,
  dissertationRoutes,
  commentRoutes,
  settingsRoutes,
  applicationRoutes,
  notificationRoutes,
  fileRoutes
};