import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, GraduationCap, Building, Calendar, Shield } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.student_profile;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Academic Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">Your personal credentials and enrollment details</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/50">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Building className="w-3.5 h-3.5" /> Institution / College
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {profile?.institution || 'Apex Institute of Physiotherapy & Allied Sciences'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <GraduationCap className="w-3.5 h-3.5" /> Degree / Course
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {profile?.course || 'Bachelor of Physiotherapy (BPT)'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Current Academic Year
            </span>
            <p className="text-sm font-semibold text-slate-800">
              Year {profile?.academic_year || 1}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Current Semester
            </span>
            <p className="text-sm font-semibold text-slate-800">
              Semester {profile?.semester || 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
