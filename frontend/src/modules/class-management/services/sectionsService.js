import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export const sectionsService = {
  list: () => apiRequest(API_ENDPOINTS.sections.list),
  get: (id) => apiRequest(API_ENDPOINTS.sections.get(id)),
  update: (id, body) =>
    apiRequest(API_ENDPOINTS.sections.update(id), {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export default sectionsService;
