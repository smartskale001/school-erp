import { apiRequest } from '@/core/api/client';

export async function getStudentQuizzes() {
  return apiRequest('/student/quizzes');
}

export async function getStudentQuizDetail(id) {
  return apiRequest(`/student/quizzes/${id}`);
}

export async function joinQuiz(quizId, data) {
  return apiRequest(`/student/quizzes/${quizId}/join`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function startQuiz(quizId) {
  return apiRequest(`/student/quizzes/${quizId}/start`, {
    method: 'POST',
  });
}

export async function saveAnswer(quizId, questionId, data) {
  return apiRequest(`/student/quizzes/${quizId}/answers/${questionId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitQuiz(quizId) {
  return apiRequest(`/student/quizzes/${quizId}/submit`, {
    method: 'POST',
  });
}

export async function getQuizResult(quizId) {
  return apiRequest(`/student/quizzes/${quizId}/result`);
}