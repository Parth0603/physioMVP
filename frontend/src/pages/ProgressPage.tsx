import React, { useEffect, useState } from 'react';
import { progressService } from '../services/progressService';
import { adaptiveService } from '../services/adaptiveService';
import {
  StudentProgress,
  ProgressSummary,
  SubjectProgressSummary,
  LearningGapItem,
  RevisionDueItem,
} from '../types';
import {
  BarChart2,
  CheckCircle2,
  Award,
  Clock,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectProgressSummary[]>([]);
  const [records, setRecords] = useState<StudentProgress[]>([]);
  const [gaps, setGaps] = useState<LearningGapItem[]>([]);
  const [revisionsDue, setRevisionsDue] = useState<RevisionDueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const [sum, recs, subjSums, gapsData, revData] = await Promise.all([
        progressService.getSummary(),
        progressService.getAllProgress(),
        adaptiveService.getSubjectProgressSummaries().catch(() => []),
        adaptiveService.getLearningGaps().catch(() => []),
        adaptiveService.getRevisionDue().catch(() => []),
      ]);
      setSummary(sum);
      setRecords(recs);
      setSubjectSummaries(subjSums);
      setGaps(gapsData);
      setRevisionsDue(revData);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#0d3834] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 2:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 3:
      default:
        return 'bg-[#edf7f6] text-[#0d3834] border-[#b0dcd5]';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Knowledge Mastery & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Objective evaluation of topic retention, clinical learning gaps, and spaced revision scheduling.
        </p>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Mastery
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0d3834]">
              {summary?.average_mastery ? Math.round(summary.average_mastery) : 0}%
            </span>
            <span className="text-xs text-[#0d3834] font-semibold">Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mastered Topics (≥80%)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#14b8a6]">
              {summary?.mastered_topics || 0}
            </span>
            <span className="text-xs text-slate-400">of {summary?.total_topics || 0} total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Learning Gaps
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{gaps.length}</span>
            <span className="text-xs text-slate-400">need reinforcement</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Practice Attempts
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0d3834]">{summary?.total_attempts || 0}</span>
            <span className="text-xs text-slate-400">assessments</span>
          </div>
        </div>
      </div>

      {/* Section 1: Subject-Wise Progress Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subject-Wise Mastery Breakdown</h2>
            <p className="text-xs text-slate-500">
              Distribution of topics across Strong, Moderate, Needs Improvement, and Weak bands
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjectSummaries.map((subj) => (
            <div
              key={subj.subject_id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{subj.subject_name}</h3>
                  <p className="text-xs text-slate-500">{subj.total_topics} Curriculum Topics</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#0d3834]">
                    {Math.round(subj.average_mastery)}%
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Subject Mastery
                  </span>
                </div>
              </div>

              {/* Band Pills */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#f0fdf9] border border-[#a7f3d0] rounded-xl p-2.5">
                  <span className="block font-black text-[#065f46] text-base">
                    {subj.strong_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#14b8a6]">Strong</span>
                </div>
                <div className="bg-[#edf7f6] border border-[#b0dcd5] rounded-xl p-2.5">
                  <span className="block font-black text-[#0d3834] text-base">
                    {subj.moderate_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#1e756c]">Moderate</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <span className="block font-black text-amber-700 text-base">
                    {subj.needs_improvement_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-600">Needs Imp</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  <span className="block font-black text-rose-700 text-base">
                    {subj.weak_count}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-rose-600">Weak</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Ranked Learning Gaps */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ranked Learning Gaps</h3>
              <p className="text-xs text-slate-500">
                Topics prioritized by the adaptive engine based on current mastery and test accuracy
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {gaps.length} Gaps
          </span>
        </div>

        {gaps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active learning gaps recorded. Great work!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Topic</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Mastery Score</th>
                  <th className="py-3.5 px-4 text-center">Practice Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gaps.map((gap) => (
                  <tr key={gap.topic_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{gap.topic_name}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{gap.subject_name}</td>
                    <td className="py-4 px-4 text-center font-black text-rose-600">
                      {Math.round(gap.mastery_score)}%
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-slate-700">
                      {Math.round(gap.accuracy)}%
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadge(
                          gap.priority_level
                        )}`}
                      >
                        {gap.priority_label === 'HIGH' || gap.priority_label === 'MEDIUM' || gap.priority_label === 'LOW'
                          ? gap.priority_label
                          : gap.priority_level === 1
                          ? 'HIGH'
                          : gap.priority_level === 2
                          ? 'MEDIUM'
                          : 'LOW'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/topics/${gap.topic_id}`}
                        className="px-3 py-1.5 bg-[#0d3834] hover:bg-[#124842] text-white rounded-xl font-bold transition-colors"
                      >
                        Reinforce
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Detailed Topic Mastery Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#edf7f6] text-[#0d3834]">
              <BarChart2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">All Topic Progress Records</h3>
              <p className="text-xs text-slate-500">
                Continuous log of student mastery, attempts, and next spaced revision date
              </p>
            </div>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No topic progress records yet. Complete a diagnostic assessment to initialize your mastery scores!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Topic</th>
                  <th className="py-3.5 px-4">Mastery Score</th>
                  <th className="py-3.5 px-4 text-center">Attempts</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Next Review</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const accuracy =
                    rec.attempts > 0 ? ((rec.correct_attempts / rec.attempts) * 100).toFixed(0) : 0;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {rec.topic?.name || `Topic #${rec.topic_id}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#14b8a6] h-2 rounded-full"
                              style={{ width: `${Math.min(rec.mastery_score, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-black text-slate-800">
                            {Math.round(rec.mastery_score)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-slate-700">
                        {rec.attempts}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-800">
                        {accuracy}%
                      </td>
                      <td className="py-4 px-4 text-center text-slate-500">
                        {rec.next_review_at ? new Date(rec.next_review_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/topics/${rec.topic_id}`}
                          className="text-[#0d3834] hover:text-[#14b8a6] font-bold"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
