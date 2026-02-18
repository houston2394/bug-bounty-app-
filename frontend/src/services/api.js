import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Socket.IO connection
let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Targets API
export const targetsApi = {
  getAll: () => api.get('/targets'),
  getById: (id) => api.get(`/targets/${id}`),
  create: (data) => api.post('/targets', data),
  update: (id, data) => api.put(`/targets/${id}`, data),
  delete: (id) => api.delete(`/targets/${id}`),
};

// Reconnaissance API
export const reconApi = {
  runPassive: (targetId) => api.post(`/recon/passive/${targetId}`),
  runActive: (targetId) => api.post(`/recon/active/${targetId}`),
  runQuickScan: (targetId) => api.post(`/recon/quick-scan/${targetId}`),
  getJobStatus: (jobId) => api.get(`/recon/status/${jobId}`),
  getResults: (targetId) => api.get(`/recon/results/${targetId}`),
};

// Vulnerabilities API
export const vulnApi = {
  getAll: () => api.get('/vulnerabilities'),
  getByTarget: (targetId) => api.get(`/vulnerabilities/target/${targetId}`),
  create: (data) => api.post('/vulnerabilities', data),
  update: (id, data) => api.put(`/vulnerabilities/${id}`, data),
  delete: (id) => api.delete(`/vulnerabilities/${id}`),
};

// Reports API
export const reportsApi = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  generate: (targetId, template) => api.post(`/reports/generate/${targetId}`, { template }),
  export: (id, format) => api.get(`/reports/${id}/export?format=${format}`, { responseType: 'blob' }),
};

export { api };
export default api;