import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { academicService } from '../services/academicService';
import { contentService } from '../services/contentService';
import { Subject, ContentItem } from '../types';
import { Shield, BookOpen, Layers, Users, Plus, CheckCircle, FileText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [subjs, cnt] = await Promise.all([
          academicService.getSubjects(),
          contentService.getAllContent(),
        ]);
        setSubjects(subjs);
        setContentList(cnt);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalUnits = subjects.reduce((acc, s) => acc + s.units.length, 0);
  const totalTopics = subjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.topics.length, 0),
    0
  );
  const verifiedContent = contentList.filter((c) => c.is_verified).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Administration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage academic syllabus, structured knowledge base, and platform settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/subjects"
            className="px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Manage Subjects
          </Link>
          <Link
            to="/admin/content"
            className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Content CMS
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subjects</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{subjects.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syllabus Units</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{totalUnits}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics</span>
          <div className="mt-2 text-3xl font-bold text-slate-900">{totalTopics}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knowledge Base Entries</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-600">{contentList.length}</span>
            <span className="text-xs text-slate-400">({verifiedContent} verified)</span>
          </div>
        </div>
      </div>

      {/* Academic Structure Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Current BPT Subjects Registry</h3>
        <div className="divide-y divide-slate-100">
          {subjects.map((sub) => (
            <div key={sub.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded mr-2">
                  {sub.code}
                </span>
                <span className="text-sm font-semibold text-slate-800">{sub.name}</span>
                <span className="text-xs text-slate-400 ml-2">
                  (Year {sub.academic_year}, Sem {sub.semester})
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {sub.units.length} Units • {sub.units.reduce((a, u) => a + u.topics.length, 0)} Topics
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
