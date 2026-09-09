import { api } from './api';
import {
  Assessment,
  AssessmentStartResponse,
  AssessmentSubmitPayload,
  AssessmentResultResponse,
} from '../types';

export const assessmentService = {
  getAssessments: async (): Promise<Assessment[]> => {
    const response = await api.get<Assessment[]>('/assessments/');
    return response.data;
  },

  getAssessment: async (id: number): Promise<Assessment> => {
    const response = await api.get<Assessment>(`/assessments/${id}`);
    return response.data;
  },

  startAssessment: async (id: number): Promise<AssessmentStartResponse> => {
    const response = await api.get<AssessmentStartResponse>(`/assessments/${id}/start`);
    return response.data;
  },

  submitAssessment: async (
    id: number,
    payload: AssessmentSubmitPayload
  ): Promise<AssessmentResultResponse> => {
    const response = await api.post<AssessmentResultResponse>(`/assessments/${id}/submit`, payload);
    return response.data;
  },
};
