import axios from 'axios';

// Default to a same-origin relative path so the deployed SPA talks to the
// Express server that serves it. Override with VITE_API_URL when the API
// lives on a different origin.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    const hadToken = Boolean(localStorage.getItem('token'));

    // Only force a logout when a previously authenticated session expires —
    // not when a login/register attempt itself returns 401.
    if (status === 401 && hadToken && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  deleteAccount: () => api.delete('/auth/account'),
  linkStudent: (studentId) => api.put('/auth/link-student', { studentId }),
  unlinkStudent: () => api.put('/auth/unlink-student'),
};

// Students API
export const studentsAPI = {
  createClass: (classData) => api.post('/students/classes', classData),
  getClasses: () => api.get('/students/classes'),
  addStudent: (studentData) => api.post('/students/add', studentData),
  getStudentsByClass: (classId) => api.get(`/students/${classId}`),
  getStudentById: (studentId) => api.get(`/students/student/${studentId}`),
};

// Observations API
export const observationsAPI = {
  logObservation: (observationData) => api.post('/observations/log', observationData),
  getParentObservations: (studentId) => api.get(`/observations/parent/child/${studentId}`),
  getRecentObservations: (studentId, limit = 10) => 
    api.get(`/observations/student/${studentId}/recent?limit=${limit}`),
};

export default api;
