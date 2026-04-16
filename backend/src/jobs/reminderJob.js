const cron = require('node-cron');
const CalendarEvent = require('../models/CalendarEvent');
const Dissertation = require('../models/Dissertation');
const User = require('../models/User');
const { sendReminderEmail } = require('../services/emailService');

const REMINDER_OFFSETS_MS = {
  at_time: 0,
  '10min': 10 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '24hours': 24 * 60 * 60 * 1000
};

const WINDOW_MS = 2 * 60 * 1000;

const getEventDateTime = (event) => {
  const dateObj = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
  } else {
    dateObj.setHours(9, 0, 0, 0);
  }
  return dateObj;
};

const processReminders = async () => {
  try {
    const now = Date.now();
    console.log(`🕐 Cron fired at: ${new Date(now).toISOString()}`);
    const maxLookahead = now + 25 * 60 * 60 * 1000;

    const candidates = await CalendarEvent.find({
      reminderType: { $ne: 'none' },
      reminderSent: false,
      status: { $in: ['accepted', 'pending'] },
      date: { $gte: new Date(now - 25 * 60 * 60 * 1000), $lte: new Date(now + 25 * 60 * 60 * 1000) }
    });

    console.log(`📋 Candidates found: ${candidates.length}`);

    for (const event of candidates) {
      try {
        const eventDateTime = getEventDateTime(event);
        const offsetMs = REMINDER_OFFSETS_MS[event.reminderType];
        if (offsetMs === undefined) continue;

        const targetSendTime = eventDateTime.getTime() - offsetMs;
        const diff = now - targetSendTime;
        if (diff < 0 || diff > WINDOW_MS) continue;

        console.log(`🔍 Event: "${event.title}" | eventDateTime: ${eventDateTime.toISOString()} | targetSendTime: ${new Date(targetSendTime).toISOString()} | diff: ${Math.round(diff / 1000)}s | window: ${Math.round(WINDOW_MS / 1000)}s | will send: ${diff <= WINDOW_MS}`);

        if (diff > WINDOW_MS) continue;

        const student = await User.findById(event.studentId);
        if (!student) continue;

        const dissertation = await Dissertation.findById(event.dissertationId);
        if (!dissertation) continue;

        await sendReminderEmail(
          student.email,
          `${student.name} ${student.surname}`,
          event,
          dissertation.title
        );

         const updated = await CalendarEvent.findOneAndUpdate(
          { _id: event._id, reminderSent: false },
          { reminderSent: true },
          { new: true }
        );
        if (!updated) continue;

        console.log(`✅ Reminder sent to ${student.email} for event "${event.title}"`);
      } catch (innerErr) {
        console.error(`❌ Failed to send reminder for event ${event._id}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error('Reminder job error:', err.message);
  }
};

const startReminderJob = () => {
  cron.schedule('* * * * *', processReminders);
  console.log('Reminder job started — runs every minute');
};

module.exports = { startReminderJob };