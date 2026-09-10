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
  content_text?: string;
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

export type Question = QuestionItem;

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

export interface SubjectProgressSummary {
  subject_id: number;
  subject_name: string;
  total_topics: number;
  average_mastery: number;
  strong_count: number;
  moderate_count: number;
  needs_improvement_count: number;
  weak_count: number;
  unattempted_count: number;
}

export interface AssessmentOptionMasked {
  id: number;
  option_text: string;
}

export interface AssessmentQuestionMasked {
  id: number;
  topic_id: number;
  topic_name?: string;
  question_text: string;
  question_type: string;
  difficulty_level: DifficultyLevel;
  options: AssessmentOptionMasked[];
}

export interface Assessment {
  id: number;
  title: string;
  type?: string;
  assessment_type?: string;
  subject_id?: number;
  description?: string;
  duration_minutes: number;
  is_active?: boolean;
  status?: string;
  created_at: string;
  question_count?: number;
}

export interface AssessmentStartResponse {
  assessment_id: number;
  title: string;
  duration_minutes: number;
  total_questions: number;
  questions: AssessmentQuestionMasked[];
}

export interface AnswerSubmission {
  question_id: number;
  answer: string;
  time_taken_seconds: number;
}

export interface AssessmentSubmitPayload {
  answers: AnswerSubmission[];
}

export interface TopicPerformanceResult {
  topic_id: number;
  topic_name: string;
  total_questions: number;
  correct_count: number;
  accuracy: number;
  prior_mastery: number;
  updated_mastery: number;
  mastery_status: string;
  priority_level: number;
  priority_label: string;
}

export interface AssessmentResultResponse {
  assessment_id: number;
  title?: string;
  assessment_title?: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy?: number;
  accuracy_percentage?: number;
  total_time_seconds: number;
  topic_breakdown?: TopicPerformanceResult[];
  topic_performances?: any[];
  strong_areas?: string[];
  weak_areas?: string[];
  recommended_focus?: string[];
  study_plan_generated?: boolean;
}

export interface LearningGapItem {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  mastery_score: number;
  band_label: string;
  priority_level: number;
  priority_label: string;
  attempts: number;
  accuracy: number;
  last_attempt_at?: string;
}

export interface RevisionDueItem {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  mastery_score: number;
  next_review_at: string;
  is_overdue: boolean;
  priority_label: string;
}

export interface StudyPlanItem {
  id: number;
  study_plan_id: number;
  topic_id: number;
  topic?: {
    id: number;
    name: string;
  };
  topic_name?: string;
  content_type?: string;
  task_type?: string;
  priority: number;
  estimated_minutes: number;
  status: string;
  completed_at?: string;
}

export interface StudyPlan {
  id: number;
  student_id: number;
  title: string;
  target_date: string;
  status: string;
  items: StudyPlanItem[];
}

// --- Part 3: Learning & Practice Types ---
export interface VivaQuestion {
  id: number;
  topic_id: number;
  question_text: string;
  expected_concepts: string[];
  model_answer?: string;
  explanation?: string;
  difficulty_level: DifficultyLevel;
  is_verified: boolean;
}

export interface VivaEvaluationResult {
  question_id: number;
  score: number;
  max_score?: number;
  feedback?: string;
  key_concepts_identified?: string[];
  identified_concepts?: string[];
  concepts_missed?: string[];
  missed_concepts?: string[];
  suggested_revision?: string;
  model_answer?: string;
  topic_id?: number;
  new_mastery_score?: number;
}

export interface ClinicalCase {
  id: number;
  topic_id: number;
  title: string;
  case_description?: string;
  description?: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  symptoms: string;
  medical_history: string;
  assessment_findings: string;
  difficulty_level: DifficultyLevel;
  is_verified: boolean;
  key_concepts?: string[];
  topic_name?: string;
}

export interface ClinicalCaseSubmission {
  hypothesis?: string;
  hypothesis_answer?: string;
  assessments?: string;
  assessment_answer?: string;
  management?: string;
  management_answer?: string;
}

export interface StageFeedback {
  score: number;
  max_score?: number;
  points_identified: string[];
  points_missed?: string[];
  expected_points?: string[];
  feedback?: string;
}

export interface ClinicalCaseResult {
  case_id: number;
  overall_score?: number;
  total_score?: number;
  max_score?: number;
  hypothesis_feedback: StageFeedback;
  assessment_feedback: StageFeedback;
  management_feedback: StageFeedback;
  learning_recommendation: string;
  topic_id: number;
  new_mastery_score?: number;
}

export interface MCQPracticeResult {
  topic_id: number;
  total_questions: number;
  attempted: number;
  correct_count: number;
  incorrect_count: number;
  accuracy: number;
  score?: number;
  max_score?: number;
  performance_band: 'Strong' | 'Needs Improvement' | 'Weak' | string;
  recommended_action: string;
  new_mastery_score: number;
}


