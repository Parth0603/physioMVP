import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { AssessmentStartResponse, AnswerSubmission } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export const AssessmentRunnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessmentData, setAssessmentData] = useState<AssessmentStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of question_id -> selected option text
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  // Map of question_id -> time spent in seconds
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadAssessment(parseInt(id, 10));
    }
  }, [id]);

  // Overall timer & per-question timer
  useEffect(() => {
    if (!assessmentData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));

      // Track time spent on current question
      if (assessmentData.questions[currentIndex]) {
        const qId = assessmentData.questions[currentIndex].id;
        setQuestionTimes((prev) => ({
          ...prev,
          [qId]: (prev[qId] || 0) + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [assessmentData, currentIndex, timeRemaining]);

  const loadAssessment = async (assessmentId: number) => {
    try {
      setLoading(true);
      const data = await assessmentService.startAssessment(assessmentId);
      setAssessmentData(data);
      setTimeRemaining(data.duration_minutes * 60);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionText: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = assessmentData?.total_questions || 0;

  const handleSubmit = async () => {
    if (!assessmentData || !id) return;
    try {
      setIsSubmitting(true);
      const answersPayload: any[] = assessmentData.questions.map((q) => ({
        question_id: q.id,
        selected_option_text: selectedAnswers[q.id] || '',
        answer: selectedAnswers[q.id] || '',
        time_taken_seconds: questionTimes[q.id] || 15,
      }));

      const result = await assessmentService.submitAssessment(parseInt(id, 10), {
        answers: answersPayload,
      });

      // Save result in sessionStorage so it survives reloads & browser history
      sessionStorage.setItem(`assessment_result_${id}`, JSON.stringify(result));

      // Pass result in navigation state with replace: true to prevent looping back into running test
      navigate(`/assessments/${id}/result`, { state: { result }, replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error submitting assessment. Please try again.');
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleExitTest = () => {
    if (window.confirm('Are you sure you want to exit this assessment? Your current answers will not be submitted.')) {
      navigate('/assessments');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0d3834] border-t-transparent mb-4" />
        <p className="text-slate-600 font-medium">Preparing your diagnostic questions...</p>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">Unable to Load Assessment</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Assessment not found.'}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3834] text-white rounded-xl font-medium text-sm hover:bg-[#124842] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Assessments
        </button>
      </div>
    );
  }

  const currentQ = assessmentData.questions[currentIndex];
  const isSelected = (optText: string) => selectedAnswers[currentQ?.id] === optText;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Exit Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExitTest}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Assessment
        </button>
        <span className="text-xs text-slate-400">All progress is stored locally during the session</span>
      </div>

      {/* Top Bar with Title, Timer & Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d3834] bg-[#edf7f6] px-2.5 py-1 rounded-md">
              Diagnostic Session
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{assessmentData.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono font-bold text-[#0d3834] text-sm">
              <Clock className="w-4 h-4 text-[#0d3834]" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              Finish & Submit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>
              {answeredCount} of {totalQuestions} Answered (
              {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#14b8a6] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Topic Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Topic: <strong className="text-[#0d3834]">{currentQ.topic_name || 'General Anatomy'}</strong>
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 capitalize">
              {currentQ.difficulty_level}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed mb-6">
            {currentQ.question_text}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((opt, idx) => {
              const selected = isSelected(opt.option_text);
              const optionLetters = ['A', 'B', 'C', 'D', 'E'];
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.option_text)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    selected
                      ? 'border-[#0d3834] bg-[#edf7f6] text-[#0d3834] shadow-sm'
                      : 'border-slate-200 hover:border-[#14b8a6] hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected
                        ? 'bg-[#0d3834] text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="text-sm md:text-base font-medium pt-0.5 leading-normal">
                    {opt.option_text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0d3834] text-white text-sm font-semibold rounded-xl hover:bg-[#124842] shadow-sm transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#14b8a6] text-white text-sm font-semibold rounded-xl hover:bg-[#0d9488] shadow transition-colors"
              >
                Review & Submit <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question Palette Drawer / Quick Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Question Palette
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {assessmentData.questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                  isCurrent
                    ? 'ring-2 ring-[#0d3834] ring-offset-2 bg-[#0d3834] text-white'
                    : isAnswered
                    ? 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Submit Assessment?</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              You have answered <strong className="text-[#0d3834]">{answeredCount}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: You have {totalQuestions - answeredCount} unanswered questions.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-sm font-semibold rounded-xl shadow transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Grading...
                  </>
                ) : (
                  'Confirm & Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
