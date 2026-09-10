import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, BookOpen, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedbackCardProps {
  title: string;
  score: number;
  maxScore?: number;
  performanceBand?: 'Strong' | 'Needs Improvement' | 'Critical Review' | string;
  identifiedPoints?: string[];
  missedPoints?: string[];
  recommendation?: string;
  topicId?: number;
  onRetry?: () => void;
  nextActionText?: string;
  nextActionPath?: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  title,
  score,
  maxScore = 100,
  performanceBand,
  identifiedPoints = [],
  missedPoints = [],
  recommendation,
  topicId,
  onRetry,
  nextActionText = 'Continue to Study Plan',
  nextActionPath = '/study-plan',
}) => {
  const navigate = useNavigate();
  const percentage = Math.round((score / maxScore) * 100);

  const getBandBadge = () => {
    if (percentage >= 75 || performanceBand === 'Strong') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Strong Understanding
        </span>
      );
    }
    if (percentage >= 50 || performanceBand === 'Needs Improvement') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          Needs Improvement
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        Review Required
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#0d3834] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold tracking-wider uppercase mb-1">
            <TrendingUp className="w-4 h-4" />
            Performance & Feedback
          </div>
          <h2 className="text-2xl font-bold text-[#faf7f2]">{title}</h2>
        </div>

        <div className="flex items-center gap-4 bg-black/20 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/10 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs text-teal-200">Total Score</div>
            <div className="text-2xl font-extrabold text-white">
              {score} <span className="text-xs font-normal text-teal-300">/ {maxScore}</span>
            </div>
          </div>
          <div className="h-9 w-px bg-white/20" />
          <div>{getBandBadge()}</div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Recommendation Box */}
        {recommendation && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal-900">Personalized Learning Recommendation</h4>
              <p className="text-sm text-teal-800 mt-1">{recommendation}</p>
            </div>
          </div>
        )}

        {/* Breakdown of identified vs missed concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identified Points */}
          <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-stone-800">
                Identified Concepts ({identifiedPoints.length})
              </h4>
            </div>
            {identifiedPoints.length > 0 ? (
              <ul className="space-y-2">
                {identifiedPoints.map((pt, i) => (
                  <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">No key concepts matched in the response.</p>
            )}
          </div>

          {/* Missed Points */}
          <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-stone-800">
                Missed / Suggested Points ({missedPoints.length})
              </h4>
            </div>
            {missedPoints.length > 0 ? (
              <ul className="space-y-2">
                {missedPoints.map((pt, i) => (
                  <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">No missed concepts identified. Excellent work!</p>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Practice
              </button>
            )}
            {topicId && (
              <button
                onClick={() => navigate(`/topics/${topicId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-teal-300 rounded-lg text-sm font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                Topic Overview
              </button>
            )}
          </div>

          <button
            onClick={() => navigate(nextActionPath)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3834] text-white rounded-lg text-sm font-medium hover:bg-[#124b46] shadow-sm transition-colors"
          >
            <span>{nextActionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
