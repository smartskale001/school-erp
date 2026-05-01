import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

function mapFromApi(t) {
  return {
    id: t.id,
    name: t.name,
    shortName: t.shortName || '',
    subject: t.subjectNames?.[0] || '',
    classes: t.gradeLevel || [],
    phone: t.phone || '',
    email: t.email || '',
    employeeCode: t.employeeCode || '',
  };
}

export async function getTeachers() {
  const list = await apiRequest(API_ENDPOINTS.teachers.list);
  return list.map(mapFromApi);
}

export async function addTeacher(teacher) {
  const payload = {
    name: teacher.name,
    shortName: teacher.shortName || '',
    email: teacher.email,
    password: teacher.password,
    phone: teacher.phone || '',
    subjectIds: teacher.subject ? [teacher.subject.toLowerCase().replace(/\s+/g, '_')] : [],
    subjectNames: teacher.subject ? [teacher.subject] : [],
    gradeLevel: teacher.classes || [],
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}

export async function updateTeacher(id, updates) {
  const payload = {
    name: updates.name,
    shortName: updates.shortName,
    phone: updates.phone,
    subjectIds: updates.subject ? [updates.subject.toLowerCase().replace(/\s+/g, '_')] : [],
    subjectNames: updates.subject ? [updates.subject] : [],
    gradeLevel: updates.classes || [],
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.update(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}

export async function deleteTeacher(id) {
  await apiRequest(API_ENDPOINTS.teachers.remove(id), { method: 'DELETE' });
}

export async function cloneTeacher(teacher) {
  const payload = {
    name: `${teacher.name} (Copy)`,
    shortName: teacher.shortName ? `${teacher.shortName}-2` : '',
    email: teacher.cloneEmail,
    password: teacher.clonePassword,
    phone: teacher.phone || '',
    subjectIds: teacher.subject ? [teacher.subject.toLowerCase().replace(/\s+/g, '_')] : [],
    subjectNames: teacher.subject ? [teacher.subject] : [],
    gradeLevel: teacher.classes || [],
  };
  const result = await apiRequest(API_ENDPOINTS.teachers.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapFromApi(result);
}
