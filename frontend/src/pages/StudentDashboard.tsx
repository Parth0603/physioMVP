import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { academicService } from '../services/academicService';
import { progressService } from '../services/progressService';
import { adaptiveService } from '../services/adaptiveService';
import {
  Subject,
  ProgressSummary,
  StudentProgress,
  StudyPlan,
  LearningGapItem,
  RevisionDueItem,
} from '../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  AlertTriangle,
  Calendar,
  CheckCircle,
  RotateCw,
  ClipboardCheck,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentProgress, setRecentProgress] = useState<StudentProgress[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [gaps, setGaps] = useState<LearningGapItem[]>([]);
  const [revisionsDue, setRevisionsDue] = useState<RevisionDueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subjs, sumData, progData, activePlan, gapsData, revData] = await Promise.all([
        academicService.getSubjects(),
        progressService.getSummary(),
        progressService.getAllProgress(),
        adaptiveService.getActiveStudyPlan().catch(() => null),
        adaptiveService.getLearningGaps().catch(() => []),
        adaptiveService.getRevisionDue().catch(() => []),
      ]);

      setSubjects(subjs);
      setSummary(sumData);
      setRecentProgress(progData);
      setStudyPlan(activePlan);
      setGaps(gapsData);
      setRevisionsDue(revData);
    } catch (err) {
      console.error('Failed to load student dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setGeneratingPlan(true);
      const newPlan = await adaptiveService.generateStudyPlan();
      setStudyPlan(newPlan);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate study plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    try {
      const updatedItem = await adaptiveService.completePlanItem(itemId);
      if (studyPlan) {
        setStudyPlan({
          ...studyPlan,
          items: studyPlan.items.map((it) => (it.id === itemId ? updatedItem : it)),
        });
      }
    } catch (err) {
      console.error('Failed to mark item completed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#0d3834] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profile = user?.student_profile;
  const hasTakenAssessment = (summary?.total_attempts || 0) > 0 || recentProgress.length > 0;

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
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

  return (
    <div className="space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf7f6] border border-[#b0dcd5] text-[#0d3834] text-xs font-semibold mb-3">
            <span>
              BPT Year {profile?.academic_year || 1} • Semester {profile?.semester || 1}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#0d3834] tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {profile?.institution || 'Apex Institute of Physiotherapy & Allied Sciences'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-[#0d3834]">
              {summary?.average_mastery ? Math.round(summary.average_mastery) : 0}%
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Avg Mastery
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-[#14b8a6]">
              {summary?.total_attempts || 0}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Attempts
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-[#0d9488]">
              {summary?.mastered_topics || 0}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Mastered
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Diagnostic CTA if no assessment taken */}
      {!hasTakenAssessment && (
        <div className="bg-[#0d3834] border border-[#155952] rounded-3xl p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-[#a7f3d0]">
              <Sparkles className="w-4 h-4 text-[#2dd4bf]" /> Action Required
            </div>
            <h3 className="text-2xl font-bold">
              Complete your diagnostic assessment to generate your personalized learning plan.
            </h3>
            <p className="text-slate-200 text-sm max-w-2xl">
              PHYSIO-SMART uses diagnostic assessment data to identify topic-level gaps, assign mastery scores, and schedule spaced revision.
            </p>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="px-6 py-3.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-bold rounded-2xl shadow transition-all flex items-center gap-2 text-sm flex-shrink-0"
          >
            <ClipboardCheck className="w-5 h-5" /> Start Diagnostic Assessment
          </button>
        </div>
      )}

      {/* Quick Actions Navigation Bar (Requirement 12) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/assessments')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-teal-400 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d3834] flex items-center justify-center mb-2.5 group-hover:bg-[#0d3834] group-hover:text-white transition-colors">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-stone-900">Diagnostic Test</span>
          <span className="text-[11px] text-stone-500">Benchmark & Gaps</span>
        </button>

        <button
          onClick={() => navigate('/subjects')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-teal-400 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d3834] flex items-center justify-center mb-2.5 group-hover:bg-[#0d3834] group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-stone-900">Subjects</span>
          <span className="text-[11px] text-stone-500">Curriculum & Units</span>
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="p-4 rounded-2xl bg-white border border-teal-200 bg-teal-50/40 hover:border-teal-500 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2.5 group-hover:bg-[#0d3834] transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-stone-900">Practice</span>
          <span className="text-[11px] text-stone-500">MCQs, Viva & Cases</span>
        </button>

        <button
          onClick={() => navigate('/progress')}
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-teal-400 hover:shadow-sm transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0d3834] flex items-center justify-center mb-2.5 group-hover:bg-[#0d3834] group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <span className="block text-xs font-bold text-stone-900">Progress</span>
          <span className="text-[11px] text-stone-500">Topic Mastery & Stats</span>
        </button>
      </div>

      {/* Grid: Main Learning Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Personalized Plan & Core Subjects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Personalized Study Plan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#edf7f6] text-[#0d3834]">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Today's Personalized Plan</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated deterministically from your identified clinical knowledge gaps
                </p>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                title="Regenerate plan from latest performance"
              >
                <RotateCw className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
                <span>Update Plan</span>
              </button>
            </div>

            {studyPlan && studyPlan.items && studyPlan.items.length > 0 ? (
              <div className="space-y-3">
                {studyPlan.items.map((item) => {
                  const isCompleted = item.status === 'completed';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-[#2dd4bf] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCompleteItem(item.id)}
                          disabled={isCompleted}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                            isCompleted
                              ? 'bg-[#14b8a6] border-[#14b8a6] text-white'
                              : 'border-slate-300 hover:border-[#0d3834] text-transparent'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </button>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.topic?.name || item.topic_name || `Topic #${item.topic_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="capitalize font-medium text-slate-600">
                              {(item.content_type || item.task_type || 'concept').replace(/_/g, ' ')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {item.estimated_minutes || 30} min
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getPriorityBadge(
                            item.priority
                          )}`}
                        >
                          P{item.priority}
                        </span>
                        {item.content_type === 'mcq' ? (
                          <Link
                            to={`/practice/mcq/${item.topic_id}`}
                            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Practice
                          </Link>
                        ) : item.content_type === 'case' ? (
                          <Link
                            to="/practice"
                            className="px-3.5 py-1.5 bg-[#0d3834] hover:bg-[#124b46] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Solve Case
                          </Link>
                        ) : (
                          <Link
                            to={`/learn/${item.topic_id}`}
                            className="px-3.5 py-1.5 bg-[#0d3834] hover:bg-[#124b46] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Start Learning
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                <p className="text-xs text-slate-500 mb-3">
                  No active study plan generated yet. Complete a diagnostic test to initialize your daily study sequence.
                </p>
                <Link
                  to="/assessments"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d3834] hover:bg-[#124842] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" /> Start Assessment
                </Link>
              </div>
            )}
          </div>

          {/* Enrolled Subjects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Core Physiotherapy Subjects</h3>
                <p className="text-xs text-slate-500">
                  Explore units, anatomical concepts, and clinical guides
                </p>
              </div>
              <Link
                to="/subjects"
                className="text-xs font-semibold text-[#0d3834] hover:text-[#14b8a6] flex items-center gap-1"
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
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#2dd4bf] hover:shadow-sm transition-all flex flex-col justify-between"
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
                        <strong>{subject.units.length}</strong> Units •{' '}
                        <strong>{totalTopics}</strong> Topics
                      </span>
                      <Link
                        to={`/subjects/${subject.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d3834] hover:text-[#14b8a6]"
                      >
                        Study <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Learning Gaps & Spaced Revision Due */}
        <div className="space-y-6">
          {/* Priority Learning Gaps */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900">Learning Gaps</h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {gaps.length} Identified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Topics needing clinical reinforcement, ranked by priority.
            </p>

            {gaps.length > 0 ? (
              <div className="space-y-3">
                {gaps.slice(0, 5).map((gap) => (
                  <div
                    key={gap.topic_id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">
                        {gap.topic_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {gap.subject_name} • {gap.attempts} Attempts
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border mb-1 ${getPriorityBadge(
                          gap.priority_level
                        )}`}
                      >
                        {gap.priority_label}
                      </span>
                      <span className="block text-xs font-black text-slate-700">
                        {Math.round(gap.mastery_score)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                {hasTakenAssessment
                  ? 'Great job! No high or medium learning gaps detected.'
                  : 'Take diagnostic assessment to identify learning gaps.'}
              </div>
            )}
          </div>

          {/* Spaced Revision Due */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#f0fdf9] text-[#0d3834]">
                  <Clock className="w-4 h-4" />
                </span>
                <h4 className="text-base font-bold text-slate-900">Revision Due</h4>
              </div>
              <span className="text-xs font-bold text-[#14b8a6]">Spaced Repetition</span>
            </div>
            <p className="text-xs text-slate-500">
              Scheduled clinical refreshers to prevent knowledge decay.
            </p>

            {revisionsDue.length > 0 ? (
              <div className="space-y-3">
                {revisionsDue.slice(0, 4).map((rev) => (
                  <div
                    key={rev.topic_id}
                    className="p-3.5 rounded-2xl bg-[#f0fdf9] border border-[#a7f3d0] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">
                        {rev.topic_name}
                      </p>
                      <p className="text-[11px] text-[#0d9488]">
                        {rev.is_overdue ? 'Due today' : 'Scheduled'} • Mastery{' '}
                        {Math.round(rev.mastery_score)}%
                      </p>
                    </div>
                    <Link
                      to={`/topics/${rev.topic_id}`}
                      className="px-3 py-1 bg-[#0d3834] hover:bg-[#124842] text-white text-[11px] font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Revise
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                No revisions due today.
              </div>
            )}
          </div>

          {/* Quick Assessment CTA Card */}
          <div className="bg-[#0d3834] border border-[#155952] rounded-3xl p-6 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#2dd4bf] text-xs font-bold uppercase tracking-wider">
              <ClipboardCheck className="w-4 h-4" /> Diagnostic Assessment
            </div>
            <h4 className="text-base font-bold">Ready for a Knowledge Check?</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Diagnostic tests re-calibrate your mastery scores and keep your daily learning plan accurate.
            </p>
            <Link
              to="/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs font-bold rounded-xl transition-colors shadow"
            >
              Take Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
