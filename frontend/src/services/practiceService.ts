import { api } from './api';
import { Question, MCQPracticeResult } from '../types';

export interface MCQSubmitPayload {
  answers: {
    question_id: number;
    selected_option_id?: number | null;
  }[];
}

export const practiceService = {
  getTopicQuestions: async (topicId: number, limit: number = 10): Promise<{ topic_id: number; count: number; questions: Question[] }> => {
    const response = await api.get<Question[] | { topic_id: number; count: number; questions: Question[] }>(`/practice/mcq/${topicId}?limit=${limit}`);
    if (Array.isArray(response.data)) {
      return { topic_id: topicId, count: response.data.length, questions: response.data };
    }
    return response.data;
  },

  submitPractice: async (topicId: number, payload: MCQSubmitPayload): Promise<MCQPracticeResult> => {
    const response = await api.post<MCQPracticeResult>(`/practice/mcq/${topicId}/submit`, payload);
    return response.data;
  },
};
