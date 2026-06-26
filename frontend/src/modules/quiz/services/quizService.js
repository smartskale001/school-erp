import { apiRequest } from '@/core/api/client';

export async function getMyQuizzes() {
  return apiRequest('/quizzes');
}

export async function getQuizById(id) {
  return apiRequest(`/quizzes/${id}`);
}

export async function createQuiz(data) {
  return apiRequest('/quizzes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addQuestion(quizId, data) {
  return apiRequest(`/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function publishQuiz(id) {
  return apiRequest(`/quizzes/${id}/publish`, {
    method: 'POST',
  });
}