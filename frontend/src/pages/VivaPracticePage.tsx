import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { vivaService } from '../services/vivaService';
import { academicService } from '../services/academicService';
import { VivaQuestion, VivaEvaluationResult, Topic } from '../types';

export const VivaPracticePage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answering state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<VivaEvaluationResult | null>(null);

  useEffect(() => {
    const fetchVivaQuestions = async () => {
      if (!topicId) return;
      try {
        setLoading(true);
        setError(null);
        const tId = parseInt(topicId, 10);
        
        const [topicData, vivaData] = await Promise.all([
          academicService.getTopic(tId).catch(() => null),
          vivaService.getQuestionsByTopic(tId),
        ]);

        setTopic(topicData);
        setQuestions(vivaData.questions || []);
      } catch (err: any) {
        console.error('Failed to load viva questions:', err);
        setError(err?.response?.data?.detail || 'Unable to load viva questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchVivaQuestions();
  }, [topicId]);

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || questions.length === 0) return;
    const currentQ = questions[currentIndex];

    try {
      setEvaluating(true);
      const res = await vivaService.evaluateVivaAnswer(currentQ.id, studentAnswer.trim());
      setEvaluation(res);
    } catch (err: any) {
      console.error('Evaluation failed:', err);
      alert(err?.response?.data?.detail || 'Error evaluating viva response.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStudentAnswer('');
      setEvaluation(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setStudentAnswer('');
      setEvaluation(null);
    }
  };

  const handleResetAnswer = () => {
    setStudentAnswer('');
    setEvaluation(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Loading viva voce simulation questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <HelpCircle className="w-12 h-12 text-teal-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-800">
            {error ? 'Viva Session Error' : 'No Viva Questions Found'}
          </h2>
          <p className="text-stone-600 text-sm">
            {error || 'There are currently no viva examination prompts available for this specific topic.'}
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#0d3834] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topic
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
          Viva Voce Simulator • Prototype Mode
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Prototype Concept Evaluation:</span> Answers are matched against key physiological and clinical concepts. Speech recognition or subjective human evaluation is not simulated.
        </div>
      </div>

      {/* Main Question & Simulation Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Question Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Difficulty: {currentQ.difficulty_level?.toUpperCase() || 'MEDIUM'}
          </span>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
            "{currentQ.question_text}"
          </h2>
          <p className="text-xs text-stone-500">
            Simulate your verbal answer by articulating the key mechanisms, structures, or clinical implications in text.
          </p>
        </div>

        {/* Student Answer Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
            Your Response
          </label>
          <textarea
            rows={5}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            disabled={!!evaluation}
            placeholder="Type your explanation here. Mention key anatomical terms, physiological functions, and clinical correlations..."
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-stone-900 bg-[#faf7f2] placeholder-stone-400 disabled:opacity-75 transition-all"
          />
        </div>

        {/* Submit or Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Question
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentIndex === questions.length - 1}
              className="inline-flex items-center gap-1 px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Next Question
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {evaluation && (
              <button
                onClick={handleResetAnswer}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Answering Again
              </button>
            )}

            {!evaluation && (
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !studentAnswer.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d3834] text-white rounded-lg text-sm font-semibold hover:bg-[#124b46] disabled:opacity-50 transition-colors shadow-sm"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating Response...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit for Evaluation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Result Feedback */}
      {evaluation && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Viva Assessment Result
              </div>
              <h3 className="text-xl font-bold text-stone-900 mt-1">Concept Mastery Score</h3>
            </div>

            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#0d3834]">
                {evaluation.score}
              </span>
              <span className="text-xs text-stone-500 font-medium"> / {evaluation.max_score}</span>
            </div>
          </div>

          {/* Feedback & Recommendation Banner */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-1">
              Personalized Feedback
            </h4>
            <p className="text-sm text-teal-950 leading-relaxed font-medium">
              {evaluation.feedback}
            </p>
            {evaluation.suggested_revision && (
              <div className="mt-2 text-xs text-teal-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Suggested revision: {evaluation.suggested_revision}</span>
              </div>
            )}
          </div>

          {/* Identified vs Missed Concepts */}
          {(() => {
            const identified = evaluation.identified_concepts || evaluation.key_concepts_identified || [];
            const missed = evaluation.missed_concepts || evaluation.concepts_missed || [];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Identified Concepts ({identified.length})
                  </div>
                  {identified.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {identified.map((concept: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No key concepts matched your response.</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Missed Concepts ({missed.length})
                  </div>
                  {missed.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {missed.map((concept: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-stone-400 italic">All key curriculum concepts covered!</p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Model Answer Reference */}
          {evaluation.model_answer && (
            <div className="p-5 rounded-xl bg-[#faf7f2] border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Model Clinical Reference Answer
              </h4>
              <p className="text-xs text-stone-800 leading-relaxed italic">
                "{evaluation.model_answer}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
