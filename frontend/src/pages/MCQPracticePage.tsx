import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Loader2, 
  HelpCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { practiceService } from '../services/practiceService';
import { academicService } from '../services/academicService';
import { FeedbackCard } from '../components/common/FeedbackCard';
import { Question, Topic, MCQPracticeResult } from '../types';

export const MCQPracticePage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: number }>({});
  const [revealedExplanations, setRevealedExplanations] = useState<{ [questionId: number]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MCQPracticeResult | null>(null);

  useEffect(() => {
    const loadPracticeData = async () => {
      if (!topicId) return;
      try {
        setLoading(true);
        setError(null);
        const tId = parseInt(topicId, 10);
        
        const [topicData, qData] = await Promise.all([
          academicService.getTopic(tId).catch(() => null),
          practiceService.getTopicQuestions(tId, 10),
        ]);

        setTopic(topicData);
        setQuestions(qData.questions || []);
      } catch (err: any) {
        console.error('Failed to load MCQ practice:', err);
        setError(err?.response?.data?.detail || 'Unable to load practice questions.');
      } finally {
        setLoading(false);
      }
    };

    loadPracticeData();
  }, [topicId]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (result) return; // Locked after completion
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleExplanation = (questionId: number) => {
    setRevealedExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSubmit = async () => {
    if (!topicId || questions.length === 0) return;
    
    // Check if at least one question answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const payload = {
        answers: questions.map(q => ({
          question_id: q.id,
          selected_option_id: selectedAnswers[q.id] || null,
        })),
      };

      const res = await practiceService.submitPractice(parseInt(topicId, 10), payload);
      setResult(res);
      // Auto-reveal all explanations on submit
      const allRevealed: { [id: number]: boolean } = {};
      questions.forEach(q => { allRevealed[q.id] = true; });
      setRevealedExplanations(allRevealed);
    } catch (err: any) {
      console.error('Failed to submit practice:', err);
      alert(err?.response?.data?.detail || 'Error submitting practice attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setRevealedExplanations({});
    setResult(null);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Loading MCQ question bank...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <HelpCircle className="w-12 h-12 text-teal-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-800">
            {error ? 'Practice Module Error' : 'No Questions Found'}
          </h2>
          <p className="text-stone-600 text-sm">
            {error || 'There are currently no verified multiple choice questions for this topic in the curriculum.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Back
            </button>
            {topicId && (
              <button
                onClick={() => navigate(`/learn/${topicId}`)}
                className="px-4 py-2 bg-[#0d3834] text-white rounded-lg text-sm font-medium hover:bg-[#124b46]"
              >
                Go to Concept Learning
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOptionId = selectedAnswers[currentQ.id];
  const isExplanationOpen = revealedExplanations[currentQ.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (!result && Object.keys(selectedAnswers).length > 0) {
              if (window.confirm('Leave practice session? Your current progress will not be saved.')) {
                navigate(-1);
              }
            } else {
              navigate(-1);
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#0d3834] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topic
        </button>

        <div className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
          {topic?.name || 'Topic'} • Board Practice
        </div>
      </div>

      {/* Result Section (If completed) */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          <FeedbackCard
            title={`${topic?.name || 'Topic'} - MCQ Performance`}
            score={result.score ?? result.correct_count}
            maxScore={result.max_score ?? result.total_questions}
            performanceBand={result.performance_band}
            identifiedPoints={[
              `Total questions attempted: ${result.attempted} of ${result.total_questions}`,
              `Correct answers: ${result.correct_count}`,
              `Overall accuracy: ${result.accuracy}%`,
            ]}
            missedPoints={
              result.incorrect_count > 0
                ? [`${result.incorrect_count} questions answered incorrectly or missed.`]
                : []
            }
            recommendation={result.recommended_action}
            topicId={topic?.id}
            onRetry={handleRetry}
            nextActionText="Continue Study Plan"
            nextActionPath="/study-plan"
          />

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200">
            <h3 className="text-sm font-bold text-stone-800">
              Review Question Breakdown Below
            </h3>
            <span className="text-xs text-stone-500">
              Click individual questions to inspect rationale
            </span>
          </div>
        </div>
      )}

      {/* Question Progress Tracker Bar */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-stone-900">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="h-4 w-px bg-stone-200" />
          <span className="text-xs text-stone-500">
            Answered: {Object.keys(selectedAnswers).length}/{questions.length}
          </span>
        </div>

        {/* Progress Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#0d3834] text-white shadow-sm ring-2 ring-teal-400'
                    : isAnswered
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
            Multiple Choice Question
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-3 leading-relaxed">
            {currentQ.question_text}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options?.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.is_correct;
            const showOutcome = result || isExplanationOpen;

            let optionStyle = 'border-stone-200 hover:border-stone-300 bg-[#faf7f2] text-stone-800';

            if (isSelected && !showOutcome) {
              optionStyle = 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600';
            } else if (showOutcome) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
              } else {
                optionStyle = 'border-stone-200 opacity-60 bg-stone-50';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                disabled={!!result}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{opt.option_text}</span>
                </div>

                {showOutcome && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {showOutcome && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Rationale Accordion */}
        {selectedOptionId && !result && (
          <div className="pt-2">
            <button
              onClick={() => toggleExplanation(currentQ.id)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
            >
              {isExplanationOpen ? 'Hide Answer & Explanation' : 'Check Answer & Explanation'}
            </button>
          </div>
        )}

        {isExplanationOpen && currentQ.explanation && (
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-stone-800 space-y-1.5 animate-fade-in">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Clinical Concept Rationale
            </div>
            <p className="leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0d3834] text-white rounded-lg text-sm font-medium hover:bg-[#124b46] transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : !result ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Practice
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2 border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
