import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { Assessment } from '../types';
import {
  ClipboardCheck,
  Clock,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAssessments();
      setAssessments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0d3834] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0d3834] border border-[#155952] rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-[#a7f3d0] mb-3">
            <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
            Physio-Smart Diagnostic Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">
            Clinical Knowledge & Diagnostic Assessments
          </h1>
          <p className="text-slate-200 text-base leading-relaxed mb-4">
            Diagnostic tests evaluate your precise topic-level mastery and learning gaps across Upper Limb, Biomechanics, and Clinical Kinesiology — powering your custom daily revision plan.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#2dd4bf]" /> Topic-Level Mastery
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#2dd4bf]" /> Deterministic Gap Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#2dd4bf]" /> Spaced Revision Plan
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Assessment Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Available Assessments</h2>
          <span className="text-sm font-medium text-slate-500">
            {assessments.length} Test{assessments.length !== 1 ? 's' : ''} Ready
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0d3834] border-t-transparent" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Assessments Available</h3>
            <p className="text-sm text-slate-500">
              Check back soon or contact your faculty coordinator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-[#14b8a6] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        (a.assessment_type || a.type || 'diagnostic') === 'diagnostic'
                          ? 'bg-[#edf7f6] text-[#0d3834] border border-[#b0dcd5]'
                          : 'bg-[#f0fdf9] text-[#065f46] border border-[#a7f3d0]'
                      }`}
                    >
                      {(a.assessment_type || a.type || 'diagnostic').toUpperCase()} TEST
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {a.duration_minutes} Mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {a.description || 'Comprehensive topic-wise assessment to evaluate clinical and anatomical concepts.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>{a.question_count || 5} Questions</span>
                  </div>
                  <button
                    onClick={() => navigate(`/assessments/${a.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d3834] hover:bg-[#124842] text-white font-semibold text-sm rounded-xl shadow transition-colors"
                  >
                    Start Test <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
