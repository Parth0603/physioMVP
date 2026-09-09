import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { academicService } from '../services/academicService';
import { ContentItem, Subject, ContentType, DifficultyLevel } from '../types';
import { Plus, Trash2, ShieldCheck, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Creator Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('concept');
  const [body, setBody] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [reference, setReference] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const loadData = async () => {
    try {
      const [cnt, subjs] = await Promise.all([
        contentService.getAllContent(),
        academicService.getSubjects(),
      ]);
      setContentList(cnt);
      setSubjects(subjs);
    } catch (err) {
      console.error('Failed to load content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) {
      alert('Please select a target topic.');
      return;
    }
    try {
      await contentService.createContent({
        topic_id: topicId,
        title,
        content_type: contentType,
        content_body: body,
        difficulty_level: difficulty,
        reference,
        is_verified: isVerified,
      });
      setIsModalOpen(false);
      setTitle('');
      setBody('');
      setReference('');
      loadData();
    } catch (err) {
      alert('Failed to save knowledge base entry.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this content item?')) return;
    try {
      await contentService.deleteContent(id);
      loadData();
    } catch (err) {
      alert('Failed to delete content.');
    }
  };

  const handleToggleVerify = async (item: ContentItem) => {
    try {
      await contentService.verifyContent(item.id, !item.is_verified);
      loadData();
    } catch (err) {
      alert('Failed to toggle verification status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Flatten all topics for selection dropdown
  const allTopics: { id: number; name: string; subjectName: string }[] = [];
  subjects.forEach((s) => {
    s.units.forEach((u) => {
      u.topics.forEach((t) => {
        allTopics.push({ id: t.id, name: t.name, subjectName: s.name });
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Knowledge Base Content CMS</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate structured, verified clinical content used for student study and future AI grounding
          </p>
        </div>
        <button
          onClick={() => {
            if (allTopics.length > 0 && !topicId) setTopicId(allTopics[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add Knowledge Base Entry
        </button>
      </div>

      {/* Content Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Curated Content</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Topic</label>
                <select
                  required
                  value={topicId || ''}
                  onChange={(e) => setTopicId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {allTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectName}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Entry Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scapulohumeral Rhythm & Force Couples"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="concept">Concept</option>
                    <option value="explanation">Explanation</option>
                    <option value="note">Clinical Note</option>
                    <option value="clinical_guideline">Clinical Guideline</option>
                    <option value="reference">Reference Text</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Content Body (Clinical/Educational Text)</label>
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter detailed, verified physiological or anatomical text..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Source / Reference</label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. BD Chaurasia Vol 1, Page 85"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verifyCheck"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="verifyCheck" className="text-slate-700 font-medium">
                  Verified by Faculty / Curriculum Committee
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Stream */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {contentList.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No content records found.</p>
          ) : (
            contentList.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.content_type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content_body}
                  </p>
                  {item.reference && (
                    <p className="text-[11px] text-slate-400 italic">Reference: {item.reference}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVerify(item)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                      item.is_verified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.is_verified ? 'Verified' : 'Unverified'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
