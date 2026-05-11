import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: "https://payout-management-backend-z3z9.onrender.com/api",
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 ────────────────────────────────────────
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

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorAPI = {
  getAll: (params = {}) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
};

// ─── Payouts ──────────────────────────────────────────────────────────────────
export const payoutAPI = {
  getAll: (params = {}) => api.get('/payouts', { params }),
  getById: (id) => api.get(`/payouts/${id}`),
  create: (data) => api.post('/payouts', data),
  submit: (id) => api.post(`/payouts/${id}/submit`),
  approve: (id) => api.post(`/payouts/${id}/approve`),
  reject: (id, reason) => api.post(`/payouts/${id}/reject`, { reason }),
};

export default api;
