import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { contentService } from '../services/contentService';
import { ContentItem } from '../types';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  FileText,
  Building,
  Briefcase,
  BookOpen,
  Award,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const facultyProfile = user?.faculty_profile;

  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContent = async () => {
    try {
      const data = await contentService.getAllContent();
      setContentList(data);
    } catch (err) {
      console.error('Failed to load faculty review list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleToggle = async (item: ContentItem) => {
    try {
      await contentService.verifyContent(item.id, !item.is_verified);
      loadContent();
    } catch (err) {
      alert('Error updating verification status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#0d3834] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unverified = contentList.filter((c) => !c.is_verified);
  const verified = contentList.filter((c) => c.is_verified);

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner with Real Profile Data */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf7f6] border border-[#b0dcd5] text-[#0d3834] text-xs font-semibold mb-3">
            <span>{facultyProfile?.designation || 'Associate Professor'}</span>
            <span>•</span>
            <span>{facultyProfile?.department || 'Musculoskeletal & Orthopedics'}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0d3834] tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {facultyProfile?.institution || 'Apex Institute of Physiotherapy & Allied Sciences'}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#14b8a6]" />
            <span>Teaching: <strong>{facultyProfile?.subjects_taught || 'Biomechanics & Orthopedic Physiotherapy'}</strong></span>
          </div>
        </div>

        <div className="bg-[#edf7f6] border border-[#b0dcd5] rounded-2xl p-4 text-center shrink-0 min-w-[160px]">
          <span className="block text-2xl font-black text-[#0d3834]">{unverified.length}</span>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pending Approvals</span>
        </div>
      </div>

      {/* Review Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
          <div className="mt-2 text-3xl font-black text-amber-600">{unverified.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Requires clinical accuracy validation</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified for Students</span>
          <div className="mt-2 text-3xl font-black text-emerald-600">{verified.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Visible in undergraduate curriculum</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Knowledge Base</span>
          <div className="mt-2 text-3xl font-black text-[#0d3834]">{contentList.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Peer-reviewed BPT entries</p>
        </div>
      </div>

      {/* Verification Workbench */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curriculum Content Review Workbench</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review syllabus explanations and clinical case references before publishing to students
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            {contentList.length} Items Total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {contentList.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/40 transition-colors">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#edf7f6] text-[#0d3834] border border-[#b0dcd5]">
                    {(item.content_type || 'content').replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content_body}</p>
                {item.reference && (
                  <p className="text-[11px] text-slate-400 italic">Academic Citation: {item.reference}</p>
                )}
              </div>

              <button
                onClick={() => handleToggle(item)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm ${
                  item.is_verified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-[#0d3834] text-white hover:bg-[#124b46]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {item.is_verified ? 'Verified (Click to Revoke)' : 'Approve & Verify'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
