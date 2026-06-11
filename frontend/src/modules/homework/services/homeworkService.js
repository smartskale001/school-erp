import { apiRequest } from '@/core/api/client';

export const homeworkService = {
  // Teacher
  createHomework: (data) => {
    let body;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = JSON.stringify(data);
    }
    return apiRequest('/homework', { method: 'POST', body });
  },
  updateHomework: (id, data) => apiRequest(`/homework/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteHomework: (id) => apiRequest(`/homework/${id}`, { method: 'DELETE' }),
  getTeacherHomework: () => apiRequest('/homework/teacher/me'),
  getClassHomework: (classId) => apiRequest(`/homework/class/${classId}`),

  // Student
  getStudentHomework: () => apiRequest('/homework/student/me'),
  getStudentStats: () => apiRequest('/homework/student/stats'),
  updateStatus: (homeworkId, status, remarks = '') => 
    apiRequest(`/homework/student/${homeworkId}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status, remarks }) 
    }),
};
