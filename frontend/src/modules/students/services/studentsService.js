import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export const studentsService = {
  list: () => apiRequest(API_ENDPOINTS.students.list),
  get: (id) => apiRequest(API_ENDPOINTS.students.get(id)),
  byClass: (classId) => apiRequest(API_ENDPOINTS.students.byClass(classId)),
  create: (body) =>
    apiRequest(API_ENDPOINTS.students.create, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export default studentsService;
