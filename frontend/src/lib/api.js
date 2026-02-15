import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchPots = () => api.get('/pots');
export const fetchPot = (slug) => api.get(`/pots/${slug}`);
export const fetchContributors = (slug) => api.get(`/pots/${slug}/contributors`);
export const createSession = (data) => api.post('/session/create-or-update', data);
export const createOrder = (data) => api.post('/razorpay/order/create', data);
export const createPaymentLink = (data) => api.post('/razorpay/payment-link', data);
export const pollSession = (id) => api.get(`/session/${id}`);
export const getSessionProgress = (id) => api.get(`/session/${id}/progress`);
export const createUpiSession = (data) => api.post('/upi/session/create', data);
export const confirmBlessing = (data) => api.post('/upi/blessing/confirm', data);
export const getConfig = () => api.get('/config');
export const updateContributionStatus = (sessionId, status) => api.post(`/admin/contributions/${sessionId}/status`, { status });
export const adminLogin = (data) => api.post('/admin/login', data);
export const fetchDashboard = () => api.get('/admin/dashboard');
export const fetchAdminPots = () => api.get('/admin/pots');
export const createPot = (data) => api.post('/admin/pots', data);
export const updatePot = (id, data) => api.put(`/admin/pots/${id}`, data);
export const archivePot = (id) => api.post(`/admin/pots/${id}/archive`);
export const addPotItem = (potId, data) => api.post(`/admin/pots/${potId}/items`, data);
export const updatePotItem = (id, data) => api.put(`/admin/pot-items/${id}`, data);
export const deletePotItem = (id) => api.delete(`/admin/pot-items/${id}`);
export const fetchContributions = () => api.get('/admin/contributions');
export const exportContributions = () => api.get('/admin/contributions/export', { responseType: 'blob' });
export const fetchSettings = () => api.get('/admin/settings');
export const updateSettings = (data) => api.put('/admin/settings', data);
