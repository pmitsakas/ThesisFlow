import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getActiveTeachers: () => api.get('/users/active-teachers')
};

export const dissertationAPI = {
  getAll: () => api.get('/dissertations'),
  getAvailable: () => api.get('/dissertations/available'),
  getMyDissertations: () => api.get('/dissertations/my-dissertations'),
  getById: (id) => api.get(`/dissertations/${id}`),
  create: (data) => api.post('/dissertations', data),
  update: (id, data) => api.put(`/dissertations/${id}`, data),
  delete: (id) => api.delete(`/dissertations/${id}`),
  assign: (id, studentId) => api.patch(`/dissertations/${id}/assign`, { studentId }),
  updateStatus: (id, status) => api.patch(`/dissertations/${id}/status`, { status }),
  updateProgress: (id, progress) => api.patch(`/dissertations/${id}/progress`, { progress_percentage: progress }),

  // Student Proposals
  propose: (data) => api.post('/dissertations/propose', data),
  getPendingProposals: () => api.get('/dissertations/pending-proposals'),
  approveProposal: (id) => api.patch(`/dissertations/${id}/approve-proposal`),
  rejectProposal: (id) => api.patch(`/dissertations/${id}/reject-proposal`),
};

export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getPending: () => api.get('/applications/pending'),
  getByDissertation: (dissertationId) => api.get(`/applications/dissertation/${dissertationId}`),
  approve: (id) => api.patch(`/applications/${id}/approve`),
  reject: (id) => api.patch(`/applications/${id}/reject`),
  delete: (id) => api.delete(`/applications/${id}`),
};

export const commentAPI = {
  getByDissertation: (dissertationId) => api.get(`/comments/dissertation/${dissertationId}`),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
  getMyComments: (limit) => api.get('/comments/my-comments', { params: { limit } }),
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (key, value, description) => api.put(`/settings/${key}`, { value, description }),
  delete: (key) => api.delete(`/settings/${key}`),
  initialize: () => api.post('/settings/initialize'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications?unreadOnly=true'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  clearAll: () => api.delete('/notifications/clear-all'),
};

export const fileAPI = {
  getByDissertation: (dissertationId) => api.get(`/files/dissertation/${dissertationId}`),
  upload: (dissertationId, formData) => api.post(`/files/dissertation/${dissertationId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  download: (fileId) => api.get(`/files/download/${fileId}`, { responseType: 'blob' }),
  delete: (fileId) => api.delete(`/files/${fileId}`),
};

export default api;