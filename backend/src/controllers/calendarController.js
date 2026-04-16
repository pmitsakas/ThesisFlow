const CalendarEvent = require('../models/CalendarEvent');
const Dissertation = require('../models/Dissertation');
const Notification = require('../models/Notification');

exports.getMyEvents = async (req, res) => {
  try {
    const studentId = req.user._id;
    const events = await CalendarEvent.find({ studentId })
      .populate('createdBy', 'name surname role')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error fetching events' } });
  }
};

exports.getDissertationEvents = async (req, res) => {
  try {
    const { dissertationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const dissertation = await Dissertation.findById(dissertationId);
    if (!dissertation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dissertation not found' } });
    }

    const isTeacherSupervisor = userRole === 'teacher' && dissertation.supervisorId.toString() === userId.toString();
    const isAssignedStudent = userRole === 'student' && dissertation.studentId && dissertation.studentId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isTeacherSupervisor && !isAssignedStudent && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const events = await CalendarEvent.find({ dissertationId })
      .populate('createdBy', 'name surname role')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Get dissertation events error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error fetching events' } });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { dissertationId, title, type, date, time, description, reminderType } = req.body;

    const userId = req.user._id;
    const userRole = req.user.role;

    const dissertation = await Dissertation.findById(dissertationId);
    if (!dissertation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dissertation not found' } });
    }

    const isTeacherSupervisor = userRole === 'teacher' && dissertation.supervisorId.toString() === userId.toString();
    const isAssignedStudent = userRole === 'student' && dissertation.studentId && dissertation.studentId.toString() === userId.toString();

    if (!isTeacherSupervisor && !isAssignedStudent) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const eventStatus = userRole === 'teacher' ? 'pending' : 'accepted';

    const event = await CalendarEvent.create({
      dissertationId,
      studentId: dissertation.studentId,
      createdBy: userId,
      createdByRole: userRole,
      title,
      type: type || 'custom',
      date,
      time: time || null,
      description: description || null,
      status: eventStatus,
      reminderType: reminderType || 'none'
    });

    if (userRole === 'teacher' && dissertation.studentId) {
      await Notification.createNotification({
        userId: dissertation.studentId,
        type: 'status_changed',
        title: 'New Calendar Event',
        message: `Your supervisor added a new event: ${title} on ${new Date(date).toLocaleDateString()}`,
        relatedId: event._id,
        relatedModel: 'Dissertation'
      });
    }

    const populated = await CalendarEvent.findById(event._id).populate('createdBy', 'name surname role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error creating event' } });
  }
};

exports.respondToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user._id;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_RESPONSE', message: 'Response must be accepted or rejected' } });
    }

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    if (event.studentId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the assigned student can respond' } });
    }

    if (event.createdByRole !== 'teacher') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: 'Can only respond to teacher events' } });
    }

    event.status = response;
    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Respond to event error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error responding to event' } });
  }
};

exports.completeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    const dissertation = await Dissertation.findById(event.dissertationId);

    const isStudent = userRole === 'student' && event.studentId.toString() === userId.toString();
    const isTeacher = userRole === 'teacher' && dissertation.supervisorId.toString() === userId.toString();

    if (!isStudent && !isTeacher) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    if (isStudent && event.createdByRole === 'teacher') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Students can only complete their own events' } });
    }

    event.status = 'completed';
    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Complete event error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error completing event' } });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    const isOwner = event.createdBy.toString() === userId.toString();
    const dissertation = await Dissertation.findById(event.dissertationId);
    const isTeacherSupervisor = userRole === 'teacher' && dissertation.supervisorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isTeacherSupervisor && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete this event' } });
    }

    if (userRole === 'student' && event.createdByRole === 'teacher') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Students cannot delete teacher events' } });
    }

    await CalendarEvent.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error deleting event' } });
  }
};