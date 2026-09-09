import { api } from './api';
import {
  LearningGapItem,
  RevisionDueItem,
  StudyPlan,
  StudyPlanItem,
  SubjectProgressSummary,
} from '../types';

export const adaptiveService = {
  getLearningGaps: async (): Promise<LearningGapItem[]> => {
    const response = await api.get<LearningGapItem[]>('/adaptive/gaps');
    return response.data;
  },

  getRevisionDue: async (): Promise<RevisionDueItem[]> => {
    const response = await api.get<RevisionDueItem[]>('/adaptive/revision-due');
    return response.data;
  },

  getActiveStudyPlan: async (): Promise<StudyPlan | null> => {
    const response = await api.get<StudyPlan | null>('/study-plans/active');
    return response.data;
  },

  generateStudyPlan: async (): Promise<StudyPlan> => {
    const response = await api.post<StudyPlan>('/adaptive/generate-plan');
    return response.data;
  },

  completePlanItem: async (itemId: number): Promise<StudyPlanItem> => {
    const response = await api.put<StudyPlanItem>(`/study-plans/items/${itemId}/complete`);
    return response.data;
  },

  getSubjectProgressSummaries: async (): Promise<SubjectProgressSummary[]> => {
    const response = await api.get<SubjectProgressSummary[]>('/progress/subjects');
    return response.data;
  },
};
