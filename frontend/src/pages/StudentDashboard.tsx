import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { academicService } from '../services/academicService';
import { progressService } from '../services/progressService';
import { Subject, ProgressSummary, StudentProgress } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentProgress, setRecentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [subjs, sumData, progData] = await Promise.all([
          academicService.getSubjects(),
          progressService.getSummary(),
          progressService.getAllProgress(),
        ]);
        setSubjects(subjs);
        setSummary(sumData);
        setRecentProgress(progData);
      } catch (err) {
        console.error('Failed to load student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profile = user?.student_profile;

  return (
    <div className="space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-semibold mb-3">
            <span>BPT Year {profile?.academic_year || 1} • Semester {profile?.semester || 1}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {profile?.institution || 'Apex Institute of Physiotherapy & Allied Sciences'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-slate-900">{summary?.average_mastery || 0}%</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Mastery</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-teal-600">{summary?.total_attempts || 0}</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Practices</span>
          </div>
        </div>
      </div>

      {/* Grid: Subjects & AI Adaptive Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Enrolled Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Core Physiotherapy Subjects</h3>
              <p className="text-xs text-slate-500">Explore units, curated anatomical concepts, and clinical guides</p>
            </div>
            <Link
              to="/subjects"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => {
              const totalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
              return (
                <div
                  key={subject.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Year {subject.academic_year}, Sem {subject.semester}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{subject.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {subject.description || 'Foundational syllabus subject.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      <strong>{subject.units.length}</strong> Units • <strong>{totalTopics}</strong> Topics
                    </span>
                    <Link
                      to={`/subjects/${subject.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Learning Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Recent Learning Activity
              </h4>
            </div>
            {recentProgress.length > 0 ? (
              <div className="space-y-3">
                {recentProgress.map((prog) => (
                  <div
                    key={prog.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{prog.topic?.name || `Topic #${prog.topic_id}`}</p>
                      <p className="text-[11px] text-slate-400">
                        {prog.attempts} attempts • {prog.correct_attempts} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-700">{prog.mastery_score.toFixed(0)}% Mastery</span>
                      <Link
                        to={`/topics/${prog.topic_id}`}
                        className="block text-[11px] text-teal-600 hover:underline font-medium"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent study activity recorded yet. Pick a subject above to begin.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Adaptive Plan Placeholder (Strictly Part 1 specification) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              Adaptive AI Engine
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Your Personalized Plan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              PHYSIO-SMART uses clinical knowledge gap analysis to tailor topic sequencing, revision intervals, and practice cases.
            </p>

            {/* Clear, honest Part 1 Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Diagnostic Assessment Pending
              </div>
              <p className="text-amber-800/90 leading-normal">
                Personalized learning will appear here after your diagnostic assessment in Part 2.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Knowledge Diagnostic</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">Part 2</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Adaptive Gap Analysis</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">Part 2</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Clinical Case Reasoning</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">Part 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
