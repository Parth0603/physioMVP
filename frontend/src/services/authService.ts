import { api } from './api';
import { AuthResponse, User, ProfileUpdateRequest } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    institution?: string;
    course?: string;
    academic_year?: number;
    semester?: number;
    enrollment_id?: string;
    department?: string;
    designation?: string;
    subjects_taught?: string;
    faculty_id_number?: string;
    employee_id?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await api.put<User>('/users/profile/me', data);
    return response.data;
  },
};
