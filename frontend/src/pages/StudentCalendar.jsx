import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

const PREDEFINED_STUDENT_TYPES = [
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'DEADLINE', label: 'Deadline' },
  { value: 'custom', label: 'Custom' },
];

const EVENT_COLORS = {
  student_accepted: 'bg-blue-500',
  student_completed: 'bg-green-500',
  teacher_pending: 'bg-orange-400',
  teacher_accepted: 'bg-purple-500',
  teacher_completed: 'bg-green-600',
  teacher_rejected: 'bg-red-400',
};

const getEventStyle = (event) => {
  if (event.createdByRole === 'teacher') {
    if (event.status === 'pending') return 'bg-orange-400 text-white';
    if (event.status === 'accepted') return 'bg-purple-500 text-white';
    if (event.status === 'completed') return 'bg-green-600 text-white';
    if (event.status === 'rejected') return 'bg-red-400 text-white';
  }
  if (event.status === 'completed') return 'bg-green-500 text-white';
  return 'bg-blue-500 text-white';
};

const StudentCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await calendarAPI.getMyEvents();
      setEvents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (eventId, response) => {
    try {
      await calendarAPI.respondToEvent(eventId, response);
      fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      alert('Failed to respond to event');
    }
  };

  const handleComplete = async (eventId) => {
    try {
      await calendarAPI.completeEvent(eventId);
      fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      alert('Failed to complete event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await calendarAPI.deleteEvent(eventId);
      fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const pendingCount = events.filter(e => e.status === 'pending' && e.createdByRole === 'teacher').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
            <p className="text-gray-500 mt-1">Track your dissertation milestones</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <FiPlus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {pendingCount > 0 && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-orange-600 font-semibold text-sm">
              🔔 You have {pendingCount} pending event{pendingCount > 1 ? 's' : ''} from your supervisor waiting for your response.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-28 border-r border-b border-gray-100 bg-gray-50" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday =
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-28 border-r border-b border-gray-100 p-1 cursor-pointer hover:bg-blue-50 transition ${selectedDay === day ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                        }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event._id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${getEventStyle(event)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span><span className="text-gray-600">My events</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span><span className="text-gray-600">Completed</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0"></span><span className="text-gray-600">Supervisor (pending)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span><span className="text-gray-600">Supervisor (accepted)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0"></span><span className="text-gray-600">Rejected</span></div>
              </div>
            </div>

            {selectedDay && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {selectedDay} {currentDate.toLocaleString('default', { month: 'long' })}
                </h3>
                <div className="space-y-2">
                  {getEventsForDay(selectedDay).length === 0 ? (
                    <p className="text-sm text-gray-500">No events</p>
                  ) : (
                    getEventsForDay(selectedDay).map(event => (
                      <div
                        key={event._id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-sm p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.time || 'All day'} · {event.status}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming</h3>
              <div className="space-y-2">
                {events
                  .filter(e => new Date(e.date) >= today && e.status !== 'completed' && e.status !== 'rejected')
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="text-sm p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.time ? ` · ${event.time}` : ''}
                      </p>
                    </div>
                  ))}
                {events.filter(e => new Date(e.date) >= today && e.status !== 'completed').length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchEvents(); }}
          isTeacher={false}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUserId={user?._id}
          onClose={() => setSelectedEvent(null)}
          onRespond={handleRespond}
          onComplete={handleComplete}
          onDelete={handleDelete}
          isTeacher={false}
        />
      )}
    </div>
  );
};

const AddEventModal = ({ onClose, onSuccess, isTeacher, dissertationId, studentId }) => {
  const TEACHER_TYPES = [
    { value: 'ΣΥΝΑΝΤΗΣΗ', label: 'Συνάντηση' },
    { value: 'ΠΑΡΟΥΣΙΑΣΗ_ΘΕΩΡΗΤΙΚΗΣ_ΜΕΛΕΤΗΣ', label: 'Παρουσίαση Θεωρητικής Μελέτης' },
    { value: 'ΠΑΡΟΥΣΙΑΣΗ_ΠΛΑΝΟΥ_ΕΡΓΑΣΙΑΣ', label: 'Παρουσίαση Πλάνου Εργασίας' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'custom', label: 'Custom' },
  ];

  const STUDENT_TYPES = [
    { value: 'MILESTONE', label: 'Milestone' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'custom', label: 'Custom' },
  ];

  const types = isTeacher ? TEACHER_TYPES : STUDENT_TYPES;

  const [form, setForm] = useState({
    title: '',
    type: types[0].value,
    date: '',
    time: '',
    description: '',
    dissertationId: dissertationId || '',
    reminderType: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myDissertation, setMyDissertation] = useState(null);

  useEffect(() => {
    if (!isTeacher && !dissertationId) {
      import('../services/api').then(({ dissertationAPI }) => {
        dissertationAPI.getMyDissertations().then(res => {
          const assigned = res.data.data?.find(d => d.status === 'assigned');
          if (assigned) {
            setMyDissertation(assigned);
            setForm(f => ({ ...f, dissertationId: assigned._id }));
          }
        }).catch(() => { });
      });
    }
  }, []);

  const handleTypeChange = (type) => {
    const preset = type !== 'custom' ? type.replace(/_/g, ' ') : '';
    setForm(f => ({
      ...f,
      type,
      title: type !== 'custom' ? preset : f.title
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dissertationId) {
      setError('No active dissertation found');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const dateToSend = form.time
        ? new Date(`${form.date}T${form.time}:00`).toISOString()
        : new Date(`${form.date}T00:00:00`).toISOString();

      await calendarAPI.createEvent({
        dissertationId: form.dissertationId,
        title: form.title,
        type: form.type,
        date: dateToSend,
        time: form.time || null,
        description: form.description || null,
        reminderType: form.reminderType,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Reminder</label>
            <select
              value={form.reminderType}
              onChange={(e) => setForm(f => ({ ...f, reminderType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No reminder</option>
              <option value="at_time">At the time of event</option>
              <option value="10min">10 minutes before</option>
              <option value="30min">30 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="24hours">24 hours before</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetailModal = ({ event, currentUserId, onClose, onRespond, onComplete, onDelete, isTeacher }) => {
  const isFromTeacher = event.createdByRole === 'teacher';
  const isOwner = event.createdBy._id === currentUserId || event.createdBy === currentUserId;
  const canDelete = isOwner || isTeacher;
  const canRespond = !isTeacher && isFromTeacher && event.status === 'pending';
  const canComplete = event.status === 'accepted' && (isOwner || isTeacher);

  const typeLabels = {
    'ΣΥΝΑΝΤΗΣΗ': 'Συνάντηση',
    'ΠΑΡΟΥΣΙΑΣΗ_ΘΕΩΡΗΤΙΚΗΣ_ΜΕΛΕΤΗΣ': 'Παρουσίαση Θεωρητικής Μελέτης',
    'ΠΑΡΟΥΣΙΑΣΗ_ΠΛΑΝΟΥ_ΕΡΓΑΣΙΑΣ': 'Παρουσίαση Πλάνου Εργασίας',
    'MILESTONE': 'Milestone',
    'DEADLINE': 'Deadline',
    'custom': 'Custom',
  };

  const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    accepted: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[event.status]}`}>
              {event.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Type</span>
            <span className="text-sm font-medium text-gray-900">{typeLabels[event.type] || event.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          {event.time && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Time</span>
              <span className="text-sm font-medium text-gray-900">{event.time}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Added by</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {event.createdBy?.name} {event.createdBy?.surname} ({event.createdByRole})
            </span>
          </div>
          {event.description && (
            <div>
              <span className="text-sm text-gray-500">Notes</span>
              <p className="text-sm text-gray-900 mt-1 bg-gray-50 rounded p-2">{event.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {canRespond && (
            <div className="flex gap-2">
              <button
                onClick={() => onRespond(event._id, 'accepted')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <FiCheck className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => onRespond(event._id, 'rejected')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FiX className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
          {canComplete && (
            <button
              onClick={() => onComplete(event._id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiCheck className="w-4 h-4" /> Mark as Completed
            </button>
          )}
          {canDelete && event.status !== 'completed' && (
            <button
              onClick={() => onDelete(event._id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <FiTrash2 className="w-4 h-4" /> Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { AddEventModal, EventDetailModal };
export default StudentCalendar;