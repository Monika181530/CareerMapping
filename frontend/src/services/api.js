import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  login: (data) => api.post('/auth/login', data).then(res => res.data),
};

export const profile = {
  getProfile: () => api.get('/profile').then(res => res.data),
  getMe: () => api.get('/profile/me').then(res => res.data),
  completeOnboarding: () => api.post('/profile/complete-onboarding').then(res => res.data),
  updateProfile: (data) => api.put('/profile', data).then(res => res.data),
  getInterests: () => api.get('/profile/interests').then(res => res.data),
  setInterests: (data) => api.put('/profile/interests', data).then(res => res.data),
  getConstraints: () => api.get('/profile/constraints').then(res => res.data),
  setConstraints: (data) => api.put('/profile/constraints', data).then(res => res.data),
};

export const skills = {
  getAllSkills: () => api.get('/skills').then(res => res.data),
  getUserSkills: () => api.get('/user-skills').then(res => res.data),
  addUserSkill: (data) => api.post('/user-skills', data).then(res => res.data),
  updateUserSkill: (id, data) => api.put(`/user-skills/${id}`, data).then(res => res.data),
  deleteUserSkill: (id) => api.delete(`/user-skills/${id}`).then(res => res.data),
  bulkAddSkills: (data) => api.post('/user-skills/bulk', data).then(res => res.data),
};

export const careers = {
  getAllCareers: () => api.get('/careers').then(res => res.data),
  getCareer: (id) => api.get(`/careers/${id}`).then(res => res.data),
  setCareerGoal: (data) => api.post('/career-goal', data).then(res => res.data),
  getCareerGoal: () => api.get('/career-goal').then(res => res.data),
};

export const skillGap = {
  analyze: () => api.post('/skill-gap/analyze').then(res => res.data),
  getSummary: () => api.get('/skill-gap/summary').then(res => res.data),
};

export const roadmap = {
  generate: () => api.post('/roadmap/generate').then(res => res.data),
  getRoadmap: () => api.get('/roadmap').then(res => res.data),
  updateItem: (id, data) => api.put(`/roadmap/items/${id}`, data).then(res => res.data),
  getProgress: () => api.get('/roadmap/progress').then(res => res.data),
};

export const monitoring = {
  getData: () => api.get('/career-monitoring').then(res => res.data),
  updateMonitoring: (data) => api.post('/career-monitoring/update', data).then(res => res.data),
  getFeasibility: () => api.get('/career-monitoring/feasibility').then(res => res.data),
};

export const recovery = {
  analyze: (data = { include_interests: true }) => api.post('/career-recovery/analyze', data).then(res => res.data),
  getRecommendations: () => api.get('/career-recovery/recommendations').then(res => res.data),
  compare: (careerIds) => api.post('/career-recovery/compare', { career_ids: careerIds }).then(res => res.data),
  getTransferableSkills: () => api.get('/career-recovery/transferable-skills').then(res => res.data),
};

export default api;
