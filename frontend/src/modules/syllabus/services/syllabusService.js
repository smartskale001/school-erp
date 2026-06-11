import { apiRequest } from '@/core/api/client';

export const syllabusService = {
  // Teacher
  createSyllabus: (data) => apiRequest('/syllabus', { method: 'POST', body: JSON.stringify(data) }),
  updateSyllabus: (id, data) => apiRequest(`/syllabus/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getTeacherSyllabus: () => apiRequest('/syllabus/teacher/me'),
  
  addChapter: (syllabusId, data) => apiRequest(`/syllabus/${syllabusId}/chapter`, { method: 'POST', body: JSON.stringify(data) }),
  updateChapter: (chapterId, data) => apiRequest(`/syllabus/chapter/${chapterId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Student
  getStudentSyllabus: () => apiRequest('/syllabus/student/me'),
};
