import { api } from './api';
import { Subject, Unit, Topic } from '../types';

export const academicService = {
  // Subjects
  getSubjects: async (year?: number, semester?: number): Promise<Subject[]> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (semester) params.append('semester', semester.toString());
    const response = await api.get<Subject[]>(`/subjects/?${params.toString()}`);
    return response.data;
  },

  getSubject: async (id: number): Promise<Subject> => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (payload: Partial<Subject>): Promise<Subject> => {
    const response = await api.post<Subject>('/subjects/', payload);
    return response.data;
  },

  updateSubject: async (id: number, payload: Partial<Subject>): Promise<Subject> => {
    const response = await api.put<Subject>(`/subjects/${id}`, payload);
    return response.data;
  },

  deleteSubject: async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },

  // Units
  getUnitsBySubject: async (subjectId: number): Promise<Unit[]> => {
    const response = await api.get<Unit[]>(`/units/subject/${subjectId}`);
    return response.data;
  },

  createUnit: async (payload: Partial<Unit>): Promise<Unit> => {
    const response = await api.post<Unit>('/units/', payload);
    return response.data;
  },

  updateUnit: async (id: number, payload: Partial<Unit>): Promise<Unit> => {
    const response = await api.put<Unit>(`/units/${id}`, payload);
    return response.data;
  },

  deleteUnit: async (id: number): Promise<void> => {
    await api.delete(`/units/${id}`);
  },

  // Topics
  getTopicsByUnit: async (unitId: number): Promise<Topic[]> => {
    const response = await api.get<Topic[]>(`/topics/unit/${unitId}`);
    return response.data;
  },

  getTopic: async (id: number): Promise<Topic> => {
    const response = await api.get<Topic>(`/topics/${id}`);
    return response.data;
  },

  createTopic: async (payload: Partial<Topic>): Promise<Topic> => {
    const response = await api.post<Topic>('/topics/', payload);
    return response.data;
  },

  updateTopic: async (id: number, payload: Partial<Topic>): Promise<Topic> => {
    const response = await api.put<Topic>(`/topics/${id}`, payload);
    return response.data;
  },

  deleteTopic: async (id: number): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },

  markTopicReviewed: async (id: number): Promise<{ message: string; topic_id: number; mastery_level: number }> => {
    const response = await api.post(`/topics/${id}/mark-reviewed`);
    return response.data;
  },
};
