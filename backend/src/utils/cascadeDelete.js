const Dissertation = require('../models/Dissertation');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const File = require('../models/File');

const deleteDissertationCascade = async (dissertationId) => {
  await Comment.deleteMany({ dissertationId });
  await Notification.deleteMany({ relatedId: dissertationId, relatedModel: 'Dissertation' });
  await File.deleteMany({ dissertationId });
  await Dissertation.findByIdAndDelete(dissertationId);
};

const deleteUserCascade = async (userId) => {
  const dissertations = await Dissertation.find({
    $or: [{ studentId: userId }, { supervisorId: userId }]
  }).select('_id');

  for (const d of dissertations) {
    await deleteDissertationCascade(d._id);
  }

  await Comment.deleteMany({ userId });
  await Notification.deleteMany({ userId });
  await File.deleteMany({ uploadedBy: userId });
  await require('../models/User').findByIdAndDelete(userId);
};

module.exports = { deleteDissertationCascade, deleteUserCascade };