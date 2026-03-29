import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      // Support legacy/new payload shapes and avoid duplicate "Bearer " prefix.
      const tokenCandidate =
        user?.token ||
        user?.accessToken ||
        user?.jwt ||
        user?.data?.token ||
        localStorage.getItem('token');

      const token = tokenCandidate
        ? String(tokenCandidate)
            .replace(/^Bearer\s+/i, '')
            .replace(/^"|"$/g, '')
            .trim()
        : '';

      if (token) {
        const authValue = `Bearer ${token}`;
        config.headers.Authorization = authValue;
      }
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear session only when the request was sent with Authorization.
      const hadToken = error.config?.headers?.Authorization;
      if (hadToken) {
        console.error('Auth error - token may be expired/invalid:', error.config?.url);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  toggle: (id) => api.patch(`/categories/${id}/toggle`),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Vendor APIs
export const vendorAPI = {
  getApproved: () => api.get('/vendors'),
  getAll: () => api.get('/vendors/all'),
  getById: (id) => api.get(`/vendors/${id}`),
  getByCategory: (categoryId) => api.get(`/vendors/category/${categoryId}`),
  getTopRated: () => api.get('/vendors/top-rated'),
  getSlots: (vendorId, date) => api.get(`/vendors/${vendorId}/slots?date=${date}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  approve: (id) => api.patch(`/vendors/${id}/approve`),
  block: (id) => api.patch(`/vendors/${id}/block`),
  toggleAvailability: (id) => api.patch(`/vendors/${id}/availability`),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Booking APIs
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getUpcoming: () => api.get('/bookings/upcoming'),
  getCompleted: () => api.get('/bookings/completed'),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  pay: (id) => api.post(`/bookings/${id}/pay`),
};

// Review APIs
export const reviewAPI = {
  getAll: () => api.get('/reviews'),
  getTopRated: () => api.get('/reviews/top-rated'),
    getTopAts: () => api.get('/reviews/top-ats'),
  getByVendor: (vendorId) => api.get(`/reviews/vendor/${vendorId}`),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
  analyzeSentiment: (comment) => api.post('/reviews/analyze-sentiment', { comment }),
  getAtsQuestions: (category) => api.get(`/reviews/ats-questions?category=${encodeURIComponent(category || 'general service')}`),
  calculateAtsScore: (answers) => api.post('/reviews/calculate-ats', answers),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getCustomers: () => api.get('/admin/users/customers'),
  getWorkers: () => api.get('/admin/users/workers'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getMessages: () => api.get('/admin/messages'),
  getUnreadMessages: () => api.get('/admin/messages/unread'),
  markMessageRead: (id) => api.patch(`/admin/messages/${id}/read`),
  markAllMessagesRead: () => api.patch('/admin/messages/read-all'),
  declineBooking: (id, reason) => api.post(`/admin/bookings/${id}/decline`, { reason }),
};

// Worker APIs
export const workerAPI = {
  getDashboard: () => api.get('/worker/dashboard'),
  getBookings: () => api.get('/worker/bookings'),
  getPendingBookings: () => api.get('/worker/bookings/pending'),
  getAvailableBookings: () => api.get('/worker/bookings/available'),
  getConfirmedBookings: () => api.get('/worker/bookings/confirmed'),
  getBookingById: (id) => api.get(`/worker/bookings/${id}`),
  acceptBooking: (id) => api.patch(`/worker/bookings/${id}/accept`),
  declineBooking: (id, reason) => api.patch(`/worker/bookings/${id}/decline`, { reason }),
  updateBookingStatus: (id, status) => api.patch(`/worker/bookings/${id}/status`, { status }),
  getProfile: () => api.get('/worker/profile'),
  updateProfile: (data) => api.put('/worker/profile', data),
  getMessages: () => api.get('/worker/messages'),
  markAllRead: () => api.patch('/worker/messages/read-all'),
  getReviews: () => api.get('/worker/reviews'),
};

// Message APIs
export const messageAPI = {
  getAllMessages: () => api.get('/messages'),
  getMyMessages: () => api.get('/messages/my-messages'),
  getBookingMessages: (bookingId) => api.get(`/messages/booking/${bookingId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  markAllAsRead: () => api.patch('/messages/read-all'),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// Parking APIs
export const parkingAPI = {
  // Slots
  getSlots: () => api.get('/parking/slots'),
  getAdditionalSlots: () => api.get('/parking/slots/additional'),
  getAvailableSlots: () => api.get('/parking/slots/available'),
  getAvailableSlotsByType: (type) => api.get(`/parking/slots/available/${type}`),
  getSlotById: (id) => api.get(`/parking/slots/${id}`),
  getAllSlots: () => api.get('/parking/slots/all'),
  createSlot: (data) => api.post('/parking/slots', data),
  updateSlot: (id, data) => api.put(`/parking/slots/${id}`, data),
  toggleSlotStatus: (id) => api.patch(`/parking/slots/${id}/toggle-status`),
  toggleSlotActive: (id) => api.patch(`/parking/slots/${id}/toggle-active`),
  deleteSlot: (id) => api.delete(`/parking/slots/${id}`),
  // Allocated slots
  getMyAllocatedSlot: () => api.get('/parking/slots/my-allocated'),
  getAllocatedSlots: () => api.get('/parking/slots/allocated'),
  allocateSlot: (slotId, data) => api.patch(`/parking/slots/${slotId}/allocate`, data),
  deallocateSlot: (slotId) => api.patch(`/parking/slots/${slotId}/deallocate`),
  // Bookings
  createBooking: (data) => api.post('/parking/bookings', data),
  getMyBookings: () => api.get('/parking/bookings/my-bookings'),
  getActiveBookings: () => api.get('/parking/bookings/active'),
  getBookingById: (id) => api.get(`/parking/bookings/${id}`),
  completeBooking: (id) => api.patch(`/parking/bookings/${id}/complete`),
  payBooking: (id) => api.patch(`/parking/bookings/${id}/pay`),
  cancelBooking: (id) => api.patch(`/parking/bookings/${id}/cancel`),
  getAllBookings: () => api.get('/parking/bookings'),
  // Stats
  getStats: () => api.get('/parking/stats'),
};

// Complaint APIs
export const complaintAPI = {
  // Customer
  fileComplaint: (data) => api.post('/complaints', data),
  getMyComplaints: () => api.get('/complaints/my-complaints'),
  getById: (id) => api.get(`/complaints/${id}`),
  // Admin
  getAll: () => api.get('/complaints'),
  getActive: () => api.get('/complaints/active'),
  getByStatus: (status) => api.get(`/complaints/status/${status}`),
  getByCategory: (category) => api.get(`/complaints/category/${category}`),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  updatePriority: (id, priority) => api.patch(`/complaints/${id}/priority`, { priority }),
  assignWorker: (id, workerId) => api.patch(`/complaints/${id}/assign`, { workerId }),
  addResponse: (id, response) => api.patch(`/complaints/${id}/respond`, { response }),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  // Worker
  getWorkerAssigned: () => api.get('/complaints/worker/assigned'),
  workerUpdateStatus: (id, status) => api.patch(`/complaints/worker/${id}/status`, { status }),
};

// SOS APIs
export const sosAPI = {
  createAlert: (data) => api.post('/sos', data),
  getMyAlerts: () => api.get('/sos/my-alerts'),
  cancelAlert: (id) => api.patch(`/sos/${id}/cancel`),
  // Admin
  getAll: () => api.get('/sos'),
  getByStatus: (status) => api.get(`/sos/status/${status}`),
  updateStatus: (id, status) => api.patch(`/sos/${id}/status`, { status }),
  getStats: () => api.get('/sos/stats'),
};

// Lift Booking APIs
export const liftBookingAPI = {
  create: (data) => api.post('/lift-bookings', data),
  getMyBookings: () => api.get('/lift-bookings/my-bookings'),
  cancel: (id) => api.patch(`/lift-bookings/${id}/cancel`),
  pay: (id) => api.post(`/lift-bookings/${id}/pay`),
  getByDate: (date) => api.get(`/lift-bookings/date/${date}`),
  // Admin
  getAll: () => api.get('/lift-bookings'),
  updateStatus: (id, status) => api.patch(`/lift-bookings/${id}/status`, { status }),
  getStats: () => api.get('/lift-bookings/stats'),
};

export default api;

