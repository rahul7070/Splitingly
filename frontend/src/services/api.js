import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://splitingly.onrender.com';
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('splitwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('splitwise_token');
      localStorage.removeItem('splitwise_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getFriends: () => apiClient.get('/users/friends'),
  searchUsers: (query) => apiClient.get(`/users/search?query=${query}`),
};

// Group APIs
export const groupAPI = {
  getGroups: () => apiClient.get('/groups'),
  getGroup: (groupId) => apiClient.get(`/groups/${groupId}`),
  createGroup: (data) => apiClient.post('/groups', data),
};

// Expense APIs
export const expenseAPI = {
  getExpenses: (groupId) => {
    const url = groupId ? `/expenses?group_id=${groupId}` : '/expenses';
    return apiClient.get(url);
  },
  createExpense: (data) => apiClient.post('/expenses', data),
};

// Settlement APIs
export const settlementAPI = {
  getSettlements: (groupId) => {
    const url = groupId ? `/settlements?group_id=${groupId}` : '/settlements';
    return apiClient.get(url);
  },
  createSettlement: (data) => apiClient.post('/settlements', data),
};

// Balance & Activity APIs
export const balanceAPI = {
  getBalances: () => apiClient.get('/balances'),
  getActivity: (type = 'all') => apiClient.get(`/activity?type=${type}`),
};

export default apiClient;
