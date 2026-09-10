import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { academicService } from '../services/academicService';
import { contentService } from '../services/contentService';
import { progressService } from '../services/progressService';
import { clinicalCaseService } from '../services/clinicalCaseService';
import { Topic, ContentItem, StudentProgress, ClinicalCase } from '../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marking, setMarking] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      if (!topicId) return;
      try {
        setLoading(true);
        const tId = Number(topicId);
        const [topicData, contentData, allProgress, caseData] = await Promise.all([
          academicService.getTopic(tId),
          contentService.getContentByTopic(tId),
          progressService.getAllProgress().catch(() => []),
          clinicalCaseService.getCases(tId).catch(() => []),
        ]);

        setTopic(topicData);
        setContents(contentData);
        setCases(caseData);

        const topicProg = allProgress.find((p: StudentProgress) => p.topic_id === tId);
        if (topicProg) {
          setProgress(topicProg);
        }
      } catch (err) {
        console.error('Failed to load topic details', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [topicId]);

  const handleMarkReviewed = async () => {
    if (!topicId) return;
    try {
      setMarking(true);
      const res = await academicService.markTopicReviewed(Number(topicId));
      setProgress(prev => prev ? { ...prev, mastery_score: res.mastery_level } : null);
    } catch (err) {
      console.error('Failed to mark reviewed', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-stone-500">Topic not found.</p>
        <button
          onClick={() => navigate('/subjects')}
          className="text-xs text-teal-600 underline mt-2 inline-block"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  const mastery = progress ? Math.round(progress.mastery_score) : 0;
  const isReviewed = mastery >= 25 || (progress?.attempts ?? 0) > 0;
  const hasAttemptedMCQ = (progress?.attempts ?? 0) > 0;
  const targetCaseId = cases.length > 0 ? cases[0].id : null;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Curriculum
      </button>

      {/* Topic Header Banner */}
      <div className="bg-[#0d3834] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-800 text-teal-200">
                {topic.difficulty_level || 'Curriculum Topic'}
              </span>
              <span className="text-xs text-teal-300">Order #{topic.order_index}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#faf7f2]">{topic.name}</h1>
            {topic.description && (
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                {topic.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 bg-black/20 p-4 rounded-xl border border-white/10 self-start sm:self-auto">
            <div className="flex items-center gap-2 text-xs text-teal-200 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Topic Mastery
            </div>
            <div className="text-2xl font-black text-white">{mastery}%</div>
            <div className="w-28 bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#14b8a6] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, mastery)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Structured Learning & Practice Flow Status (Requirement 13) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          Curriculum Learning Milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Milestone 1: Concepts */}
          <div className="p-4 rounded-xl border border-stone-200 bg-[#faf7f2] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">1. Learning</span>
                {isReviewed ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">○ Pending</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">Core physiological and anatomical concepts</p>
            </div>

            <button
              onClick={() => navigate(`/learn/${topic.id}`)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#0d3834] text-white text-xs font-semibold hover:bg-[#124b46] transition-colors flex items-center justify-center gap-1"
            >
              <span>{isReviewed ? 'Review Concepts' : 'Start Learning'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Milestone 2: MCQs */}
          <div className="p-4 rounded-xl border border-stone-200 bg-[#faf7f2] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">2. MCQs</span>
                {hasAttemptedMCQ ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attempted
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">○ Pending</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">Board-style objective questions</p>
            </div>

            <button
              onClick={() => navigate(`/practice/mcq/${topic.id}`)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1"
            >
              <span>Practice MCQs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Milestone 3: Viva Voce */}
          <div className="p-4 rounded-xl border border-stone-200 bg-[#faf7f2] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">3. Viva Voce</span>
                <span className="text-xs text-stone-400">○ Simulator</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">Oral exam question drills & keyword check</p>
            </div>

            <button
              onClick={() => navigate(`/practice/viva/${topic.id}`)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-stone-300 text-stone-700 bg-white text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1"
            >
              <span>Start Viva</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Milestone 4: Clinical Reasoning */}
          <div className="p-4 rounded-xl border border-stone-200 bg-[#faf7f2] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">4. Clinical Reasoning</span>
                <span className="text-xs text-stone-400">○ Patient Case</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">Multi-stage real physiotherapy clinical case</p>
            </div>

            <button
              onClick={() => {
                if (targetCaseId) {
                  navigate(`/practice/case/${targetCaseId}`);
                } else {
                  navigate('/practice');
                }
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#0d3834] text-white text-xs font-semibold hover:bg-[#124b46] transition-colors flex items-center justify-center gap-1"
            >
              <span>Solve Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Revision Due Note */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Spaced repetition cycle: {mastery < 50 ? 'Revision recommended today' : 'On track for weekly review'}</span>
          </div>
          <button
            onClick={handleMarkReviewed}
            disabled={marking}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
          >
            {marking ? 'Updating...' : 'Quick Mark Reviewed'}
          </button>
        </div>
      </div>

      {/* Content Items Stream */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Verified Syllabus Content ({contents.length})
        </h3>

        {contents.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-400">
            No knowledge base entries in this topic yet.
          </div>
        ) : (
          contents.map((content) => (
            <article
              key={content.id}
              className="bg-white border border-stone-200 rounded-xl p-6 sm:p-7 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                    {(content.content_type || 'content').replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-base font-bold text-stone-900">{content.title}</h4>
                </div>

                {content.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Faculty Verified
                  </span>
                )}
              </div>

              <div className="prose prose-sm text-stone-700 leading-relaxed max-w-none whitespace-pre-line">
                {content.content_body || content.content_text}
              </div>

              {content.reference && (
                <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 flex items-center gap-1.5 italic">
                  <Bookmark className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Reference: {content.reference}</span>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};
