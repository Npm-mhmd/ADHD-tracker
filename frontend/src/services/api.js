import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
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
