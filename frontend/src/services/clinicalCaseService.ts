import { api } from './api';
import { ClinicalCase, ClinicalCaseSubmission, ClinicalCaseResult } from '../types';

export const clinicalCaseService = {
  getCases: async (topicId?: number): Promise<ClinicalCase[]> => {
    const params = topicId ? `?topic_id=${topicId}` : '';
    const response = await api.get<ClinicalCase[]>(`/clinical-cases/${params}`);
    return response.data;
  },

  getCase: async (caseId: number): Promise<ClinicalCase> => {
    const response = await api.get<ClinicalCase>(`/clinical-cases/${caseId}`);
    return response.data;
  },

  submitCaseReasoning: async (caseId: number, submission: ClinicalCaseSubmission): Promise<ClinicalCaseResult> => {
    const response = await api.post<ClinicalCaseResult>(`/clinical-cases/${caseId}/submit`, submission);
    return response.data;
  },
};
