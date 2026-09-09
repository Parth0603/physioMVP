export type UserRole = 'student' | 'faculty' | 'admin';

export interface StudentProfile {
  id: number;
  user_id: number;
  institution: string;
  course: string;
  academic_year: number;
  semester: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  student_profile?: StudentProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  name: string;
  email: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ContentType =
  | 'concept'
  | 'explanation'
  | 'note'
  | 'clinical_guideline'
  | 'reference';

export interface ContentItem {
  id: number;
  topic_id: number;
  title: string;
  content_type: ContentType;
  content_body: string;
  difficulty_level: DifficultyLevel;
  reference?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface QuestionItem {
  id: number;
  topic_id: number;
  question_text: string;
  question_type: string;
  difficulty_level: DifficultyLevel;
  explanation?: string;
  correct_answer: string;
  is_verified: boolean;
  created_at: string;
  options: QuestionOption[];
}

export interface Topic {
  id: number;
  unit_id: number;
  name: string;
  description?: string;
  order_index: number;
  difficulty_level: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  contents?: ContentItem[];
  questions?: QuestionItem[];
}

export interface Unit {
  id: number;
  subject_id: number;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  topics: Topic[];
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  academic_year: number;
  semester: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  units: Unit[];
}

export interface StudentProgress {
  id: number;
  student_id: number;
  topic_id: number;
  mastery_score: number;
  attempts: number;
  correct_attempts: number;
  confidence_score: number;
  last_attempt_at?: string;
  next_review_at?: string;
  updated_at: string;
  topic?: Topic;
}

export interface ProgressSummary {
  total_topics: number;
  mastered_topics: number;
  in_progress_topics: number;
  average_mastery: number;
  total_attempts: number;
}
