import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { academicService } from '../services/academicService';
import { Subject } from '../types';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await academicService.getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filtered = selectedYear === 'all'
    ? subjects
    : subjects.filter((s) => s.academic_year === selectedYear);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">BPT Curriculum Subjects</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore structured units and topics across academic years</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Years</option>
            <option value={1}>1st Year BPT</option>
            <option value={2}>2nd Year BPT</option>
            <option value={3}>3rd Year BPT</option>
            <option value={4}>4th Year BPT</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject) => {
          const totalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
          return (
            <div
              key={subject.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/50">
                    {subject.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Year {subject.academic_year} • Sem {subject.semester}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {subject.description || 'Verified physiotherapy subject.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {subject.units.length} Units ({totalTopics} Topics)
                </span>
                <Link
                  to={`/subjects/${subject.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  Explore <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
