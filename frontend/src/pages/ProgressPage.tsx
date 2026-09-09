import React, { useEffect, useState } from 'react';
import { progressService } from '../services/progressService';
import { StudentProgress, ProgressSummary } from '../types';
import { BarChart2, CheckCircle2, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [records, setRecords] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sum, recs] = await Promise.all([
          progressService.getSummary(),
          progressService.getAllProgress(),
        ]);
        setSummary(sum);
        setRecords(recs);
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Student Knowledge Mastery</h2>
        <p className="text-xs text-slate-500 mt-0.5">Continuous evaluation of topic comprehension and practice retention</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Mastery</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.average_mastery || 0}%</span>
            <span className="text-xs text-teal-600 font-semibold">Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics Mastered (≥80%)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{summary?.mastered_topics || 0}</span>
            <span className="text-xs text-slate-400">of {summary?.total_topics || 0} total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{summary?.in_progress_topics || 0}</span>
            <span className="text-xs text-slate-400">topics active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Practice Attempts</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-600">{summary?.total_attempts || 0}</span>
            <span className="text-xs text-slate-400">attempts</span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Topic Mastery Breakdown</h3>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No topic progress records yet. Start exploring curriculum topics to track retention!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Mastery Score</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const accuracy = rec.attempts > 0 ? ((rec.correct_attempts / rec.attempts) * 100).toFixed(0) : 0;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {rec.topic?.name || `Topic #${rec.topic_id}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${Math.min(rec.mastery_score, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700">{rec.mastery_score.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{rec.attempts}</td>
                      <td className="py-3 px-4 text-slate-600">{accuracy}%</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/topics/${rec.topic_id}`}
                          className="text-teal-600 hover:text-teal-700 font-semibold"
                        >
                          Revise
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
