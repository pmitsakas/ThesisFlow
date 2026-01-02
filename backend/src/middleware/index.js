const auth = require('./auth');
const roleCheck = require('./roleCheck');
const validation = require('./validation');
const errorHandler = require('./errorHandler');

module.exports = {
  ...auth,
  ...roleCheck,
  ...validation,
  ...errorHandler
};