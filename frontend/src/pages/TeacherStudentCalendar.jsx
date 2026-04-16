import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { AddEventModal, EventDetailModal } from './StudentCalendar';

const TeacherStudentCalendar = ({ dissertationId, studentName, onClose }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [dissertationId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await calendarAPI.getDissertationEvents(dissertationId);
      setEvents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
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

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

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

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const d = new Date(event.date);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Calendar</h2>
            <p className="text-gray-500 text-sm mt-1">{studentName}'s dissertation timeline</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <FiPlus className="w-4 h-4" />
              Add Event
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg transition">
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-gray-900">{monthName}</h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg transition">
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`e-${i}`} className="h-24 border-r border-b border-gray-100 bg-gray-50" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = getEventsForDay(day);
                      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`h-24 border-r border-b border-gray-100 p-1 cursor-pointer hover:bg-blue-50 transition ${selectedDay === day ? 'bg-blue-50' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
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
                            {dayEvents.length > 2 && <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 2}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legend</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>Student events</span></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span><span>Your events (pending)</span></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span>Your events (accepted)</span></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span>Completed</span></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span><span>Rejected</span></div>
                  </div>
                </div>

                {selectedDay && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {selectedDay} {currentDate.toLocaleString('default', { month: 'long' })}
                    </h4>
                    <div className="space-y-1">
                      {getEventsForDay(selectedDay).length === 0 ? (
                        <p className="text-xs text-gray-500">No events</p>
                      ) : getEventsForDay(selectedDay).map(event => (
                        <div key={event._id} onClick={() => setSelectedEvent(event)} className="text-xs p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-gray-500">{event.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Summary</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Total events</span><span className="font-semibold">{events.length}</span></div>
                    <div className="flex justify-between"><span>Completed</span><span className="font-semibold text-green-600">{events.filter(e => e.status === 'completed').length}</span></div>
                    <div className="flex justify-between"><span>Pending response</span><span className="font-semibold text-orange-600">{events.filter(e => e.status === 'pending').length}</span></div>
                    <div className="flex justify-between"><span>Upcoming</span><span className="font-semibold text-blue-600">{events.filter(e => new Date(e.date) >= today && e.status !== 'completed').length}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchEvents(); }}
          isTeacher={true}
          dissertationId={dissertationId}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUserId={user?._id}
          onClose={() => setSelectedEvent(null)}
          onRespond={() => {}}
          onComplete={handleComplete}
          onDelete={handleDelete}
          isTeacher={true}
        />
      )}
    </div>
  );
};

export default TeacherStudentCalendar;