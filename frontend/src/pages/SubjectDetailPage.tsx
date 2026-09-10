import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { academicService } from '../services/academicService';
import { Subject } from '../types';
import { ChevronRight, ArrowLeft, BookOpen, Layers, CheckCircle } from 'lucide-react';

export const SubjectDetailPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      if (!subjectId) return;
      try {
        const data = await academicService.getSubject(Number(subjectId));
        setSubject(data);
      } catch (err) {
        console.error('Failed to load subject', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Subject not found.</p>
        <Link to="/subjects" className="text-xs text-teal-600 underline mt-2 inline-block">
          Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      {/* Subject Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60">
            {subject.code}
          </span>
          <span className="text-xs font-medium text-slate-400">
            Year {subject.academic_year} • Semester {subject.semester}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{subject.name}</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">{subject.description}</p>
      </div>

      {/* Units & Topics Hierarchy */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900">Syllabus Units & Topics</h3>

        {(!subject.units || subject.units.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No units added to this subject yet.
          </div>
        ) : (
          (subject.units || []).map((unit) => (
            <div key={unit.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{unit.name}</h4>
                  {unit.description && <p className="text-xs text-slate-500 mt-0.5">{unit.description}</p>}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {unit.topics?.length || 0} Topics
                </span>
              </div>

              {/* Topics inside unit */}
              <div className="divide-y divide-slate-100">
                {(!unit.topics || unit.topics.length === 0) ? (
                  <p className="p-4 text-xs text-slate-400 italic">No topics under this unit yet.</p>
                ) : (
                  unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-slate-800">{topic.name}</h5>
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                              topic.difficulty_level === 'beginner'
                                ? 'bg-emerald-50 text-emerald-700'
                                : topic.difficulty_level === 'intermediate'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {topic.difficulty_level}
                          </span>
                        </div>
                        {topic.description && (
                          <p className="text-xs text-slate-500 mt-1 max-w-2xl line-clamp-1">{topic.description}</p>
                        )}
                      </div>

                      <Link
                        to={`/topics/${topic.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 shrink-0 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        Study <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
