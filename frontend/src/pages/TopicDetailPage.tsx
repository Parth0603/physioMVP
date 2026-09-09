import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { academicService } from '../services/academicService';
import { contentService } from '../services/contentService';
import { progressService } from '../services/progressService';
import { Topic, ContentItem } from '../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Bookmark,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const TopicDetailPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'concept' | 'clinical_guideline' | 'reference'>('all');

  useEffect(() => {
    const fetch = async () => {
      if (!topicId) return;
      try {
        const [topicData, contentData] = await Promise.all([
          academicService.getTopic(Number(topicId)),
          contentService.getContentByTopic(Number(topicId)),
        ]);
        setTopic(topicData);
        setContents(contentData);
      } catch (err) {
        console.error('Failed to load topic details', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [topicId]);

  const handleMarkLearned = async () => {
    if (!topicId) return;
    try {
      await progressService.updateTopicProgress(Number(topicId), {
        mastery_score: 85.0,
        attempts: 1,
        correct_attempts: 1,
        confidence_score: 0.9,
      });
      setCompleted(true);
    } catch (err) {
      console.error('Failed to update progress', err);
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
        <p className="text-sm text-slate-500">Topic not found.</p>
        <Link to="/subjects" className="text-xs text-teal-600 underline mt-2 inline-block">
          Back to Curriculum
        </Link>
      </div>
    );
  }

  const filteredContents = activeTab === 'all'
    ? contents
    : contents.filter((c) => c.content_type === activeTab);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Curriculum
      </Link>

      {/* Topic Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  topic.difficulty_level === 'beginner'
                    ? 'bg-emerald-50 text-emerald-700'
                    : topic.difficulty_level === 'intermediate'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {topic.difficulty_level}
              </span>
              <span className="text-xs text-slate-400">Order #{topic.order_index}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{topic.name}</h2>
            {topic.description && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{topic.description}</p>
            )}
          </div>

          <button
            onClick={handleMarkLearned}
            disabled={completed}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
              completed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {completed ? 'Marked as Mastered' : 'Mark Topic Mastered'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Content ({contents.length})
          </button>
          <button
            onClick={() => setActiveTab('concept')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'concept'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Concepts
          </button>
          <button
            onClick={() => setActiveTab('clinical_guideline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'clinical_guideline'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Clinical Guidelines
          </button>
        </div>
      </div>

      {/* Content Items Stream */}
      <div className="space-y-5">
        {filteredContents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No knowledge base entries in this category yet.
          </div>
        ) : (
          filteredContents.map((content) => (
            <article
              key={content.id}
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                    {content.content_type.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{content.title}</h3>
                </div>

                {content.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Faculty Verified
                  </span>
                )}
              </div>

              {/* Content Body formatted in clean markdown-style layout */}
              <div className="prose prose-sm text-slate-700 leading-relaxed max-w-none whitespace-pre-line">
                {content.content_body}
              </div>

              {/* Verified Source Reference */}
              {content.reference && (
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5 italic">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
