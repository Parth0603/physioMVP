import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { AssessmentResultResponse } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  RotateCw,
  ChevronLeft,
} from 'lucide-react';

export const AssessmentResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result] = useState<AssessmentResultResponse | null>(() => {
    if (location.state?.result) return location.state.result;
    if (id) {
      try {
        const cached = sessionStorage.getItem(`assessment_result_${id}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return null;
  });

  if (!result) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Assessment Result Available</h2>
        <p className="text-sm text-slate-600 mb-6">
          Take a diagnostic assessment to evaluate your knowledge and generate an adaptive study plan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/assessments')}
            className="px-5 py-2.5 bg-[#0d3834] text-white rounded-xl font-semibold text-sm hover:bg-[#124842] transition-colors"
          >
            View Assessments
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const getPriorityBadgeClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 2:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 3:
        return 'bg-[#edf7f6] text-[#0d3834] border-[#b0dcd5]';
      default:
        return 'bg-[#f0fdf9] text-[#065f46] border-[#a7f3d0]';
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-[#14b8a6]';
    if (score >= 60) return 'text-[#0d3834]';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const breakdown: any[] = (result as any).topic_performances || (result as any).topic_breakdown || [];
  const strongAreas = result.strong_areas || [];
  const weakAreas = result.weak_areas || [];
  const overallAcc = Math.round(result.accuracy ?? (result as any).accuracy_percentage ?? 0);
  const displayTitle = result.title || (result as any).assessment_title || 'Diagnostic Assessment';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0d3834] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Dashboard
        </button>
        <button
          onClick={() => navigate('/assessments')}
          className="text-xs font-semibold text-[#0d3834] hover:underline"
        >
          All Assessments
        </button>
      </div>

      {/* Header Result Summary Card */}
      <div className="bg-[#0d3834] border border-[#155952] rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-[#a7f3d0] mb-2">
              <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
              Diagnostic Evaluation Complete
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{displayTitle}</h1>
            <p className="text-slate-200 text-sm max-w-lg">
              Your topic-level clinical performance has been analyzed. Topic mastery scores have been updated and an adaptive study plan has been generated.
            </p>
          </div>

          {/* Score Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[200px]">
            <div className="text-5xl font-black tracking-tight text-white mb-1">
              {overallAcc}%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#a7f3d0]">
              Overall Accuracy
            </div>
            <div className="text-xs text-slate-200 mt-2 font-medium">
              {result.correct_answers} of {result.total_questions} Correct
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Questions
          </div>
          <div className="text-2xl font-black text-slate-900">{result.total_questions}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-[#14b8a6] mb-1">
            Correct
          </div>
          <div className="text-2xl font-black text-[#14b8a6]">{result.correct_answers}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            Incorrect
          </div>
          <div className="text-2xl font-black text-rose-600">{result.incorrect_answers}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Time Taken
          </div>
          <div className="text-2xl font-black text-[#0d3834] flex items-center justify-center gap-1">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>{formatSeconds(result.total_time_seconds || 0)}</span>
          </div>
        </div>
      </div>

      {/* Strong Areas vs Weak Areas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf9] text-[#0d3834] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#14b8a6]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Strong Areas</h3>
              <p className="text-xs text-slate-500">Mastery &ge; 60%</p>
            </div>
          </div>

          {strongAreas.length > 0 ? (
            <ul className="space-y-2.5">
              {strongAreas.map((topic, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-sm font-semibold text-[#065f46] bg-[#f0fdf9] border border-[#a7f3d0] px-3.5 py-2 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#14b8a6] flex-shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No topics in the strong band yet.</p>
          )}
        </div>

        {/* Needs Attention / Weak Areas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Needs Attention</h3>
              <p className="text-xs text-slate-500">High & Medium Priority Gaps</p>
            </div>
          </div>

          {weakAreas.length > 0 ? (
            <ul className="space-y-2.5">
              {weakAreas.map((topic, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-sm font-semibold text-rose-900 bg-rose-50/70 border border-rose-100 px-3.5 py-2 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#14b8a6] font-medium">
              Excellent! No critical learning gaps identified in this test.
            </p>
          )}
        </div>
      </div>

      {/* Topic Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Topic-Wise Performance Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed accuracy, updated mastery scores, and adaptive study priority
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#edf7f6] text-[#0d3834] rounded-full">
            {breakdown.length} Topics Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Topic</th>
                <th className="px-6 py-3.5 text-center">Score</th>
                <th className="px-6 py-3.5 text-center">Accuracy</th>
                <th className="px-6 py-3.5 text-center">Prior Mastery</th>
                <th className="px-6 py-3.5 text-center">Updated Mastery</th>
                <th className="px-6 py-3.5 text-center">Adaptive Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.map((tb: any) => {
                const acc = Math.round(tb.accuracy_percentage ?? tb.accuracy ?? 0);
                const prior = Math.round(tb.mastery_score_before ?? tb.prior_mastery ?? 50);
                const updated = Math.round(tb.mastery_score_after ?? tb.updated_mastery ?? 50);
                const count = tb.total_questions ?? tb.questions_count ?? 1;
                const pLevel = tb.priority_level ?? 2;
                const pLabel = tb.mastery_band || tb.priority_label || (pLevel === 1 ? 'High Gap' : 'Normal');

                return (
                  <tr key={tb.topic_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {tb.topic_name}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {tb.correct_count} / {count}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800">{acc}%</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      {prior}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-black ${getMasteryColor(updated)}`}>
                        {updated}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getPriorityBadgeClass(
                          pLevel
                        )}`}
                      >
                        {pLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Focus & Action CTA */}
      <div className="bg-[#0d3834] border border-[#155952] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
            <BookOpen className="w-4 h-4" /> Recommended Clinical Focus
          </div>
          <h4 className="text-lg font-bold">
            {(result.recommended_focus && result.recommended_focus.length > 0)
              ? result.recommended_focus.join(' • ')
              : 'Keep practicing to maintain high mastery!'}
          </h4>
          <p className="text-xs text-slate-200">
            An adaptive study plan has been automatically generated based on these priority gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/assessments"
            className="px-4 py-2.5 border border-slate-600 hover:bg-white/10 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-4 h-4" /> Retake Test
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center gap-2"
          >
            View My Learning Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
