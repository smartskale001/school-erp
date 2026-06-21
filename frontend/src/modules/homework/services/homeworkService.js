import { apiRequest } from '@/core/api/client';

export const homeworkService = {
  getTeacherContext: () => apiRequest('/homework/teacher/context'),
  createHomework: (data) => apiRequest('/homework', { method: 'POST', body: data }),
  getTeacherHomework: () => apiRequest('/homework/teacher/me'),
  getHomework: (id) => apiRequest(`/homework/${id}`),
  updateHomework: (id, data) => apiRequest(`/homework/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addAssignments: (id, data) => apiRequest(`/homework/${id}/assignments`, { method: 'POST', body: JSON.stringify(data) }),
  getAssignmentSubmissions: (id) => apiRequest(`/homework/assignments/${id}/submissions`),
  reviewSubmission: (id, data) => apiRequest(`/homework/submissions/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) }),
  getStudentHomework: () => apiRequest('/homework/student/me'),
  getStudentAssignment: (id) => apiRequest(`/homework/student/assignments/${id}`),
  submitHomework: (id, data) => apiRequest(`/homework/student/assignments/${id}/submission`, { method: 'POST', body: data }),
  monitor: (query = '') => apiRequest(`/homework/monitor${query}`),
  updateStatus: (id, status) => apiRequest(`/homework/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getTeachingAssignments: () => apiRequest('/teaching-assignments'),
  createTeachingAssignment: (data) => apiRequest('/teaching-assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateTeachingAssignment: (id, data) => apiRequest(`/teaching-assignments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
