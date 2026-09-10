import { api } from './api';
import { VivaQuestion, VivaEvaluationResult } from '../types';

export const vivaService = {
  getQuestionsByTopic: async (topicId: number): Promise<{ topic_id: number; count: number; questions: VivaQuestion[] }> => {
    const response = await api.get<VivaQuestion[] | { topic_id: number; count: number; questions: VivaQuestion[] }>(`/viva/topic/${topicId}`);
    if (Array.isArray(response.data)) {
      return { topic_id: topicId, count: response.data.length, questions: response.data };
    }
    return response.data;
  },

  evaluateVivaAnswer: async (questionId: number, studentAnswer: string): Promise<VivaEvaluationResult> => {
    const response = await api.post<VivaEvaluationResult>(`/viva/${questionId}/evaluate`, {
      student_answer: studentAnswer,
    });
    return response.data;
  },
};
