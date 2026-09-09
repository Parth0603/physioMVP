import React, { useEffect, useState } from 'react';
import { academicService } from '../services/academicService';
import { Subject, Unit, Topic } from '../types';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Layers, BookOpen } from 'lucide-react';

export const AdminSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Subject
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subYear, setSubYear] = useState(1);
  const [subSem, setSubSem] = useState(1);

  // Unit creation state
  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitDesc, setUnitDesc] = useState('');

  // Topic creation state
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [topicDiff, setTopicDiff] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const fetchSubjects = async () => {
    try {
      const data = await academicService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await academicService.createSubject({
        name: subName,
        code: subCode,
        description: subDesc,
        academic_year: subYear,
        semester: subSem,
        is_active: true,
      });
      setIsSubjectModalOpen(false);
      setSubName('');
      setSubCode('');
      setSubDesc('');
      fetchSubjects();
    } catch (err) {
      alert('Error creating subject. Ensure code and name are unique.');
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject and all its units/topics?')) return;
    try {
      await academicService.deleteSubject(id);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete subject.');
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubjectId) return;
    try {
      await academicService.createUnit({
        subject_id: activeSubjectId,
        name: unitName,
        description: unitDesc,
        order_index: 1,
      });
      setActiveSubjectId(null);
      setUnitName('');
      setUnitDesc('');
      fetchSubjects();
    } catch (err) {
      alert('Failed to add unit.');
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!window.confirm('Delete this unit?')) return;
    try {
      await academicService.deleteUnit(id);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete unit.');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnitId) return;
    try {
      await academicService.createTopic({
        unit_id: activeUnitId,
        name: topicName,
        description: topicDesc,
        difficulty_level: topicDiff,
        order_index: 1,
        is_active: true,
      });
      setActiveUnitId(null);
      setTopicName('');
      setTopicDesc('');
      fetchSubjects();
    } catch (err) {
      alert('Failed to create topic.');
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await academicService.deleteTopic(id);
      fetchSubjects();
    } catch (err) {
      alert('Failed to delete topic.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Curriculum Structure Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage Subjects, Units, and Topics for the BPT Knowledge Tree</p>
        </div>
        <button
          onClick={() => setIsSubjectModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject Name</label>
                <input
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Clinical Orthopaedics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Code</label>
                  <input
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="ORTH301"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Year</label>
                  <select
                    value={subYear}
                    onChange={(e) => setSubYear(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Semester</label>
                  <select
                    value={subSem}
                    onChange={(e) => setSubSem(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Brief curriculum description..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Hierarchy Stream */}
      <div className="space-y-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Subject Row */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/50">
                  {subject.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{subject.name}</h3>
                <span className="text-xs text-slate-400">
                  (Year {subject.academic_year} • Semester {subject.semester})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubjectId(subject.id)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Unit
                </button>
                <button
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Unit Creator Form */}
            {activeSubjectId === subject.id && (
              <form onSubmit={handleCreateUnit} className="p-4 bg-teal-50/50 border-b border-slate-200 text-xs flex gap-2">
                <input
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Unit Title (e.g. Unit 3: Shoulder Complex Kinematics)"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  value={unitDesc}
                  onChange={(e) => setUnitDesc(e.target.value)}
                  placeholder="Short description (optional)"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                >
                  Save Unit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubjectId(null)}
                  className="px-2 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Units List */}
            <div className="divide-y divide-slate-100">
              {subject.units.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 italic">No units registered for this subject.</p>
              ) : (
                subject.units.map((unit) => (
                  <div key={unit.id} className="p-4 sm:px-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-800">{unit.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveUnitId(unit.id)}
                          className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Topic
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Topic Creator Form */}
                    {activeUnitId === unit.id && (
                      <form onSubmit={handleCreateTopic} className="mb-3 p-3 bg-slate-50 rounded-lg text-xs space-y-2">
                        <div className="flex gap-2">
                          <input
                            required
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                            placeholder="Topic Title (e.g. Scapulohumeral Rhythm)"
                            className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                          <select
                            value={topicDiff}
                            onChange={(e) => setTopicDiff(e.target.value as any)}
                            className="px-2 py-1.5 border border-slate-300 rounded bg-white"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <input
                          value={topicDesc}
                          onChange={(e) => setTopicDesc(e.target.value)}
                          placeholder="Topic description..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveUnitId(null)}
                            className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-teal-600 text-white font-semibold rounded hover:bg-teal-700"
                          >
                            Save Topic
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Topics List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      {unit.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{topic.name}</p>
                            <span className="text-[10px] text-slate-400 capitalize">{topic.difficulty_level}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
