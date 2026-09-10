import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Stethoscope, 
  Award, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { contentService } from '../services/contentService';
import { clinicalCaseService } from '../services/clinicalCaseService';
import { Topic, ContentItem, ClinicalCase } from '../types';

export const ConceptLearningPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [reviewedSuccess, setReviewedSuccess] = useState(false);

  useEffect(() => {
    const fetchLearningData = async () => {
      if (!topicId) return;
      try {
        setLoading(true);
        setError(null);
        const tId = parseInt(topicId, 10);
        
        const [topicData, items, cases] = await Promise.all([
          academicService.getTopic(tId),
          contentService.getContentByTopic(tId),
          clinicalCaseService.getCases(tId).catch(() => []),
        ]);

        setTopic(topicData);
        setContentList(items);
        setClinicalCases(cases);
      } catch (err: any) {
        console.error('Failed to load topic learning data:', err);
        setError(err?.response?.data?.detail || 'Unable to load topic content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [topicId]);

  const handleMarkReviewed = async () => {
    if (!topicId) return;
    try {
      setMarking(true);
      await academicService.markTopicReviewed(parseInt(topicId, 10));
      setReviewedSuccess(true);
      setTimeout(() => setReviewedSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to mark topic as reviewed:', err);
      alert(err?.response?.data?.detail || 'Could not update review status.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-stone-600 font-medium">Loading concept modules...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-800 mb-2">Unable to Load Topic</h2>
          <p className="text-stone-600 mb-6">{error || 'Topic not found.'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0d3834] text-white rounded-lg text-sm hover:bg-[#124b46]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse structured concepts if content exists
  const mainContent = contentList[0];
  const clinicalCaseId = clinicalCases.length > 0 ? clinicalCases[0].id : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#0d3834] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          Core Concept Syllabus
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0d3834] text-white rounded-2xl p-6 sm:p-10 shadow-sm border border-stone-200 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-teal-800 text-teal-200">
            Concept Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#faf7f2] tracking-tight">
            {topic.name}
          </h1>
          <p className="text-stone-300 max-w-2xl leading-relaxed text-sm sm:text-base">
            {topic.description || 'Master the foundational anatomical and clinical mechanisms of this topic.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handleMarkReviewed}
              disabled={marking || reviewedSuccess}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                reviewedSuccess
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[#14b8a6] hover:bg-[#0d9488] text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {marking ? 'Recording Review...' : reviewedSuccess ? 'Marked as Reviewed ✓' : 'Mark as Reviewed'}
            </button>
            {reviewedSuccess && (
              <span className="text-xs text-emerald-300 font-medium animate-fade-in">
                Progress logged to your learning record!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structured Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Topic Overview & Structure
            </h2>
            <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {mainContent?.content_text || topic.description || 'Detailed topic overview will be rendered here.'}
            </div>
          </div>

          {/* Key Concepts */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              Essential Concepts & Clinical Pearls
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf7f2] border border-stone-200">
                <span className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0" />
                <div className="text-sm text-stone-800">
                  <span className="font-semibold text-stone-900">Functional Stability:</span> Stability is provided through coordinated dynamic force-couples (musculature) and static restraints (capsule and labrum).
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf7f2] border border-stone-200">
                <span className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0" />
                <div className="text-sm text-stone-800">
                  <span className="font-semibold text-stone-900">Pathological Correlation:</span> Imbalances in neuromuscular timing lead to impingement, tissue degradation, and abnormal kinematics.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf7f2] border border-stone-200">
                <span className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0" />
                <div className="text-sm text-stone-800">
                  <span className="font-semibold text-stone-900">Rehabilitation Principle:</span> Progressive loading and proprioceptive retraining restore joint congruency without provoking tissue inflammation.
                </div>
              </li>
            </ul>
          </div>

          {/* Academic References */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-500" />
              Recommended BPT References
            </h3>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <span>1. B.D. Chaurasia Human Anatomy - Volume 1 (Regional & Applied Dissection)</span>
                <span className="text-teal-700 font-semibold">Standard Reference</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                <span>2. Kisner & Colby - Therapeutic Exercise: Foundations and Techniques</span>
                <span className="text-teal-700 font-semibold">Clinical Protocol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Hub Action Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5 sticky top-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Practice this Topic</h3>
              <p className="text-xs text-stone-500 mt-1">
                Cement your understanding through multi-modal assessments and clinical problem solving.
              </p>
            </div>

            <div className="space-y-3">
              {/* MCQ Practice */}
              <button
                onClick={() => navigate(`/practice/mcq/${topic.id}`)}
                className="w-full text-left p-4 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-teal-900">
                      Practice MCQs
                    </h4>
                    <p className="text-xs text-stone-500">Board exam pattern questions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Viva Voce Practice */}
              <button
                onClick={() => navigate(`/practice/viva/${topic.id}`)}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-[#faf7f2] hover:bg-stone-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-700 text-white flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#0d3834]">
                      Viva Voce Practice
                    </h4>
                    <p className="text-xs text-stone-500">Oral examination question simulation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Clinical Case Practice */}
              <button
                onClick={() => {
                  if (clinicalCaseId) {
                    navigate(`/practice/case/${clinicalCaseId}`);
                  } else {
                    navigate('/practice');
                  }
                }}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-[#faf7f2] hover:bg-stone-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0d3834] text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#0d3834]">
                      Clinical Reasoning
                    </h4>
                    <p className="text-xs text-stone-500">Real physiotherapy patient case</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <button
                onClick={() => navigate(`/topics/${topic.id}`)}
                className="w-full py-2.5 text-center text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                View Full Topic Curriculum & Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
