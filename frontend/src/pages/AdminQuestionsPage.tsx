import React, { useState, useEffect } from 'react';
import { questionService } from '../services/questionService';
import { academicService } from '../services/academicService';
import { QuestionItem, Subject, DifficultyLevel } from '../types';
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export const AdminQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  // Form Fields
  const [formTopicId, setFormTopicId] = useState<number>(0);
  const [formText, setFormText] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('intermediate');
  const [formExplanation, setFormExplanation] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadQuestions();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await academicService.getSubjects();
      setSubjects(data);
    } catch (err: any) {
      console.error('Failed to load subjects', err);
    }
  };

  const loadQuestions = async (topicId?: number) => {
    try {
      setLoading(true);
      const data = await questionService.getQuestions(topicId);
      setQuestions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterTopic = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
    setSelectedTopicId(val);
    loadQuestions(val);
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormDifficulty('intermediate');
    setFormExplanation('');
    setFormCorrectAnswer('');
    setFormOptions(['', '', '', '']);
    // Default to first available topic
    const firstTopic = subjects[0]?.units[0]?.topics[0]?.id || 0;
    setFormTopicId(firstTopic);
    setShowModal(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormTopicId(q.topic_id);
    setFormText(q.question_text);
    setFormDifficulty(q.difficulty_level);
    setFormExplanation(q.explanation || '');
    setFormCorrectAnswer(q.correct_answer);
    setFormOptions(
      q.options.length >= 4
        ? q.options.map((o) => o.option_text)
        : [...q.options.map((o) => o.option_text), '', '', ''].slice(0, 4)
    );
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCorrectAnswer) {
      alert('Please select or specify the correct answer');
      return;
    }

    try {
      setSaving(true);
      const optionsPayload = formOptions
        .filter((opt) => opt.trim() !== '')
        .map((opt) => ({
          option_text: opt.trim(),
          is_correct: opt.trim().toLowerCase() === formCorrectAnswer.trim().toLowerCase(),
        }));

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, {
          topic_id: formTopicId,
          question_text: formText,
          difficulty_level: formDifficulty,
          explanation: formExplanation,
          correct_answer: formCorrectAnswer,
          options: optionsPayload,
        });
      } else {
        await questionService.createQuestion({
          topic_id: formTopicId,
          question_text: formText,
          difficulty_level: formDifficulty,
          explanation: formExplanation,
          correct_answer: formCorrectAnswer,
          is_verified: true,
          options: optionsPayload,
        });
      }

      setShowModal(false);
      loadQuestions(selectedTopicId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionService.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete question');
    }
  };

  const handleToggleVerify = async (id: number) => {
    try {
      const updated = await questionService.verifyQuestion(id);
      setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } catch (err: any) {
      alert('Failed to update verification');
    }
  };

  // Flatten all topics for dropdown selector
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
          <h1 className="text-2xl font-bold text-slate-900">Clinical Question Repository</h1>
          <p className="text-sm text-slate-500">
            Create, manage, and verify topic-aligned MCQs for diagnostic tests and adaptive learning.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filter Topic:</span>
          <select
            value={selectedTopicId || ''}
            onChange={handleFilterTopic}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Topics ({allTopics.length})</option>
            {allTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.subjectName} — {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing {questions.length} Question{questions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <p className="text-slate-500 font-medium">No questions found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const topicMeta = allTopics.find((t) => t.id === q.topic_id);
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {topicMeta ? `${topicMeta.subjectName} • ${topicMeta.name}` : `Topic #${q.topic_id}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 capitalize">
                      {q.difficulty_level}
                    </span>
                    <button
                      onClick={() => handleToggleVerify(q.id)}
                      className={`text-xs px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 border transition-colors ${
                        q.is_verified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {q.is_verified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Unverified
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Question"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="font-semibold text-slate-900 text-base">{q.question_text}</h3>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {q.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        opt.is_correct || opt.option_text === q.correct_answer
                          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.option_text}</span>
                      {(opt.is_correct || opt.option_text === q.correct_answer) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
                    <strong className="text-slate-800">Clinical Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingQuestion ? 'Edit Clinical MCQ' : 'Create New Clinical MCQ'}
            </h2>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Topic
                  </label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    {allTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.subjectName} — {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Question Text (Clinical Stem)
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Which muscle initiates shoulder abduction from 0° to 15°?"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[i] = e.target.value;
                          setFormOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormCorrectAnswer(opt)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors flex-shrink-0 ${
                          formCorrectAnswer && formCorrectAnswer === opt
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {formCorrectAnswer && formCorrectAnswer === opt ? 'Correct' : 'Mark Correct'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Designated Correct Answer
                </label>
                <input
                  type="text"
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  placeholder="Text of correct answer"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Clinical Explanation
                </label>
                <textarea
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this option is correct based on anatomical and biomechanical evidence."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
                >
                  {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
