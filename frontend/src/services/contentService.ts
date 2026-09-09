import { api } from './api';
import { ContentItem } from '../types';

export const contentService = {
  getContentByTopic: async (topicId: number): Promise<ContentItem[]> => {
    const response = await api.get<ContentItem[]>(`/content/topic/${topicId}`);
    return response.data;
  },

  getAllContent: async (topicId?: number): Promise<ContentItem[]> => {
    const params = topicId ? `?topic_id=${topicId}` : '';
    const response = await api.get<ContentItem[]>(`/content/${params}`);
    return response.data;
  },

  createContent: async (payload: Partial<ContentItem>): Promise<ContentItem> => {
    const response = await api.post<ContentItem>('/content/', payload);
    return response.data;
  },

  updateContent: async (id: number, payload: Partial<ContentItem>): Promise<ContentItem> => {
    const response = await api.put<ContentItem>(`/content/${id}`, payload);
    return response.data;
  },

  verifyContent: async (id: number, isVerified: boolean): Promise<ContentItem> => {
    const response = await api.patch<ContentItem>(`/content/${id}/verify?is_verified=${isVerified}`);
    return response.data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/content/${id}`);
  },
};
