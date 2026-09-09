import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { ContentItem } from '../types';
import { ShieldCheck, CheckCircle, Clock, FileText } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
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
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unverified = contentList.filter((c) => !c.is_verified);
  const verified = contentList.filter((c) => c.is_verified);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Faculty Content Verification Queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review curriculum knowledge entries to ensure clinical accuracy before making them visible to students
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</span>
          <div className="mt-2 text-3xl font-bold text-amber-600">{unverified.length}</div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-slate-200">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified for Students</span>
          <div className="mt-2 text-3xl font-bold text-emerald-600">{verified.length}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Curriculum Content Review Workbench</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {contentList.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  item.is_verified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
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
