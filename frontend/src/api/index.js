import api from './axios.js';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  google: (credential) => api.post('/auth/google', { credential }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const centerAPI = {
  getAll: (params) => api.get('/centers', { params }),
  getMy: () => api.get('/centers/my'),
  getOne: (id) => api.get(`/centers/${id}`),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  getStats: (id) => api.get(`/centers/${id}/stats`),
  getRevenue: (id) => api.get(`/centers/${id}/revenue`),
  regenerateCode: (id) => api.post(`/centers/${id}/invitation-code`),
  removeTeacher: (centerId, teacherId) =>
    api.delete(`/centers/${centerId}/teachers/${teacherId}`),
};

export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getOne: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  joinCenter: (invitationCode) => api.post('/teachers/join-center', { invitationCode }),
  createAcademy: (data) => api.post('/teachers/independent-academy', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
};

export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  addComment: (id, data) => api.post(`/courses/${id}/comments`, data),
};

export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMy: () => api.get('/enrollments/my'),
  getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
  updateProgress: (id, data) => api.put(`/enrollments/${id}/progress`, data),
};

export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const liveSessionAPI = {
  getAll: (params) => api.get('/live-sessions', { params }),
  getOne: (id) => api.get(`/live-sessions/${id}`),
  create: (data) => api.post('/live-sessions', data),
  join: (id) => api.post(`/live-sessions/${id}/join`),
  updateStatus: (id, status) => api.put(`/live-sessions/${id}/status`, { status }),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  verifyCenter: (id) => api.put(`/admin/centers/${id}/verify`),
  verifyTeacher: (id) => api.put(`/admin/teachers/${id}/verify`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  createReport: (data) => api.post('/admin/reports', data),
};

export const aiAPI = {
  smartSearch: (data) => api.post('/ai/smart-search', data),
  recommendations: () => api.get('/ai/recommendations'),
  assistant: (data) => api.post('/ai/assistant', data),
  generateQuiz: (data) => api.post('/ai/generate-quiz', data),
  studyPlanner: (data) => api.post('/ai/study-planner', data),
  chatbot: (data) => api.post('/ai/chatbot', data),
  summarize: (data) => api.post('/ai/summarize', data),
};

export const uploadAPI = {
  image: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  video: (formData) => api.post('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  pdf: (formData) => api.post('/upload/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  quiz: (data) => api.post('/upload/quiz', data),
  exam: (data) => api.post('/upload/exam', data),
};

export const paymentAPI = {
  createCheckout: (courseId, provider) =>
    api.post('/payments/create-checkout', { courseId, provider }),
  verify: (params) => api.get('/payments/verify', { params }),
  history: () => api.get('/payments/history'),
  cmiCallback: (data) => api.post('/payments/cmi/callback', data),
};

export const quizAPI = {
  getOne: (id) => api.get(`/quizzes/${id}`),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
};

export const examAPI = {
  getOne: (id) => api.get(`/exams/${id}`),
  start: (id) => api.post(`/exams/${id}/start`),
  submit: (id, data) => api.post(`/exams/${id}/submit`, data),
};
