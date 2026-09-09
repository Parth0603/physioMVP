import { api } from './api';
import { StudentProgress, ProgressSummary } from '../types';

export const progressService = {
  getSummary: async (): Promise<ProgressSummary> => {
    const response = await api.get<ProgressSummary>('/progress/summary');
    return response.data;
  },

  getAllProgress: async (): Promise<StudentProgress[]> => {
    const response = await api.get<StudentProgress[]>('/progress/');
    return response.data;
  },

  updateTopicProgress: async (
    topicId: number,
    payload: { mastery_score?: number; attempts?: number; correct_attempts?: number; confidence_score?: number }
  ): Promise<StudentProgress> => {
    const response = await api.post<StudentProgress>(`/progress/topic/${topicId}`, payload);
    return response.data;
  },
};
