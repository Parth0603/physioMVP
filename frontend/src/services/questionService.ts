import { api } from './api';
import { QuestionItem } from '../types';

export interface CreateQuestionPayload {
  topic_id: number;
  question_text: string;
  question_type?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
  correct_answer: string;
  is_verified?: boolean;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export const questionService = {
  getQuestions: async (topicId?: number): Promise<QuestionItem[]> => {
    const url = topicId ? `/questions/?topic_id=${topicId}` : '/questions/';
    const response = await api.get<QuestionItem[]>(url);
    return response.data;
  },

  getQuestion: async (id: number): Promise<QuestionItem> => {
    const response = await api.get<QuestionItem>(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (payload: CreateQuestionPayload): Promise<QuestionItem> => {
    const response = await api.post<QuestionItem>('/questions/', payload);
    return response.data;
  },

  updateQuestion: async (id: number, payload: Partial<CreateQuestionPayload>): Promise<QuestionItem> => {
    const response = await api.put<QuestionItem>(`/questions/${id}`, payload);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  verifyQuestion: async (id: number): Promise<QuestionItem> => {
    const response = await api.patch<QuestionItem>(`/questions/${id}/verify`);
    return response.data;
  },
};
