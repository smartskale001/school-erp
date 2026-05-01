import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function saveTimetableToDb(gridsByClass, publishWindow = {}) {
  return apiRequest(API_ENDPOINTS.timetable.publish, {
    method: 'POST',
    body: JSON.stringify({
      grids: gridsByClass,
      effectiveFrom: publishWindow.effectiveFrom || undefined,
      effectiveTo: publishWindow.effectiveTo || undefined,
    }),
  });
}

export async function loadTimetableFromDb() {
  try {
    const result = await apiRequest(API_ENDPOINTS.timetable.active);
    return result?.grids || null;
  } catch {
    return null;
  }
}

export async function loadTimetableSettings() {
  try {
    return await apiRequest(API_ENDPOINTS.timetable.settings);
  } catch {
    return null;
  }
}

export async function saveTimetableSettings(periodSlots, workingDays, rules) {
  return apiRequest(API_ENDPOINTS.timetable.settings, {
    method: 'POST',
    body: JSON.stringify({ periodSlots, workingDays, rules }),
  });
}
