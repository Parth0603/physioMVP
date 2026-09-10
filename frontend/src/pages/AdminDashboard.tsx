import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { academicService } from '../services/academicService';
import { contentService } from '../services/contentService';
import { Subject, ContentItem } from '../types';
import {
  Shield,
  BookOpen,
  Layers,
  Users,
  Plus,
  CheckCircle,
  FileText,
  Building,
  Briefcase,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const adminProfile = user?.admin_profile;

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
        setSubjects(Array.isArray(subjs) ? subjs : []);
        setContentList(Array.isArray(cnt) ? cnt : []);
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
        <div className="w-8 h-8 border-4 border-[#0d3834] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalUnits = subjects.reduce((acc, s) => acc + (s.units?.length || 0), 0);
  const totalTopics = subjects.reduce(
    (acc, s) =>
      acc + (s.units || []).reduce((uAcc, u) => uAcc + (u.topics?.length || 0), 0),
    0
  );
  const verifiedContent = contentList.filter((c) => c.is_verified).length;

  return (
    <div className="space-y-8">
      {/* Admin Welcome Banner with Profile Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf7f6] border border-[#b0dcd5] text-[#0d3834] text-xs font-semibold mb-3">
            <span>{adminProfile?.designation || 'Academic Administrator'}</span>
            <span>•</span>
            <span>{adminProfile?.department || 'Academic Affairs & Examination Council'}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0d3834] tracking-tight">
            System Administration — {user?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {adminProfile?.institution || 'Apex Institute of Physiotherapy & Allied Sciences'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            to="/admin/subjects"
            className="px-4 py-2.5 rounded-xl bg-[#0d3834] text-white text-xs font-bold hover:bg-[#124b46] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Manage Subjects
          </Link>
          <Link
            to="/admin/content"
            className="px-4 py-2.5 rounded-xl bg-[#14b8a6] text-white text-xs font-bold hover:bg-[#0d9488] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Content CMS
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</span>
          <div className="mt-2 text-3xl font-black text-[#0d3834]">{subjects.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">BPT Curriculum Modules</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syllabus Units</span>
          <div className="mt-2 text-3xl font-black text-[#0d3834]">{totalUnits}</div>
          <p className="text-[11px] text-slate-400 mt-1">Structured Core Units</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topics</span>
          <div className="mt-2 text-3xl font-black text-[#0d3834]">{totalTopics}</div>
          <p className="text-[11px] text-slate-400 mt-1">Fine-Grained Learning Units</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Base</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#14b8a6]">{contentList.length}</span>
            <span className="text-xs text-slate-500 font-semibold">({verifiedContent} verified)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified Clinical Entries</p>
        </div>
      </div>

      {/* Academic Structure Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Current BPT Subjects Registry</h3>
        <div className="divide-y divide-slate-100">
          {subjects.map((sub) => {
            const subUnits = sub.units || [];
            const subTopicsCount = subUnits.reduce(
              (a, u) => a + (u.topics?.length || 0),
              0
            );

            return (
              <div key={sub.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0d3834] bg-[#edf7f6] border border-[#b0dcd5] px-2.5 py-0.5 rounded-md mr-2">
                    {sub.code}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{sub.name}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    (Year {sub.academic_year}, Sem {sub.semester})
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500">
                  <strong>{subUnits.length}</strong> Units • <strong>{subTopicsCount}</strong> Topics
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
