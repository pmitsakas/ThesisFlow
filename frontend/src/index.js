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
};

export const dissertationAPI = {
  getAll: () => api.get('/dissertations'),
  getAvailable: () => api.get('/dissertations/available'),
  getMyDissertations: () => api.get('/dissertations/my-dissertations'),
  getById: (id) => api.get(`/dissertations/${id}`),
  create: (data) => api.post('/dissertations', data),
  update: (id, data) => api.put(`/dissertations/${id}`, data),
  assign: (id, studentId) => api.patch(`/dissertations/${id}/assign`, { studentId }),
  updateStatus: (id, status) => api.patch(`/dissertations/${id}/status`, { status }),
  updateProgress: (id, progress) => api.patch(`/dissertations/${id}/progress`, { progress_percentage: progress }),
};

export default api;