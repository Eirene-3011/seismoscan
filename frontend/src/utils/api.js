import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('seismoscan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('seismoscan_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Buildings
export const buildingAPI = {
  getAll: (params) => api.get('/buildings', { params }),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

// RVS Assessments
export const rvsAPI = {
  getAll: (params) => api.get('/rvs', { params }),
  getById: (id) => api.get(`/rvs/${id}`),
  create: (data) => api.post('/rvs', data),
  update: (id, data) => api.put(`/rvs/${id}`, data),
  delete: (id) => api.delete(`/rvs/${id}`),
  computeScore: (data) => api.post('/rvs/compute-score', data),
};

// Reports
export const reportAPI = {
  getReport: (id) => api.get(`/reports/${id}`),
  getDashboardStats: () => api.get('/reports/dashboard'),
};

// Photos
export const photoAPI = {
  upload: (formData) => api.post('/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByBuilding: (buildingId) => api.get('/photos', { params: { building_id: buildingId } }),
  delete: (id) => api.delete(`/photos/${id}`),
};

// Users (Admin)
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const API_BASE_URL = API_BASE;

export default api;
