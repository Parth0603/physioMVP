import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  GraduationCap,
  Building,
  Calendar,
  Shield,
  BookOpen,
  Briefcase,
  IdCard,
  Edit3,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentProfile = user?.student_profile;
  const facultyProfile = user?.faculty_profile;
  const adminProfile = user?.admin_profile;

  // Edit form state
  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(
    studentProfile?.institution ||
      facultyProfile?.institution ||
      adminProfile?.institution ||
      'Apex Institute of Physiotherapy & Allied Sciences'
  );

  // Student edits
  const [academicYear, setAcademicYear] = useState(studentProfile?.academic_year || 1);
  const [semester, setSemester] = useState(studentProfile?.semester || 1);
  const [enrollmentId, setEnrollmentId] = useState(studentProfile?.enrollment_id || '');

  // Faculty edits
  const [department, setDepartment] = useState(
    facultyProfile?.department || 'Musculoskeletal & Orthopedics'
  );
  const [designation, setDesignation] = useState(
    facultyProfile?.designation || 'Assistant Professor'
  );
  const [subjectsTaught, setSubjectsTaught] = useState(
    facultyProfile?.subjects_taught || 'Biomechanics & Kinesiology, Orthopedics'
  );
  const [facultyIdNumber, setFacultyIdNumber] = useState(
    facultyProfile?.faculty_id_number || ''
  );

  // Admin edits
  const [adminDepartment, setAdminDepartment] = useState(
    adminProfile?.department || 'Academic Affairs & Examination Council'
  );
  const [adminDesignation, setAdminDesignation] = useState(
    adminProfile?.designation || 'Academic Administrator'
  );
  const [employeeId, setEmployeeId] = useState(adminProfile?.employee_id || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: any = {
        name: name.trim(),
        institution: institution.trim(),
      };

      if (user?.role === 'student') {
        payload.academic_year = academicYear;
        payload.semester = semester;
        payload.enrollment_id = enrollmentId.trim() || undefined;
      } else if (user?.role === 'faculty') {
        payload.department = department.trim();
        payload.designation = designation.trim();
        payload.subjects_taught = subjectsTaught.trim();
        payload.faculty_id_number = facultyIdNumber.trim() || undefined;
      } else if (user?.role === 'admin') {
        payload.department = adminDepartment.trim();
        payload.designation = adminDesignation.trim();
        payload.employee_id = employeeId.trim() || undefined;
      }

      await updateProfile(payload);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic & Role Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional credentials, departmental affiliations, and platform role
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3834] text-white rounded-xl text-xs font-semibold hover:bg-[#124b46] transition-colors shadow-sm self-start"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile successfully updated and synchronized across your workspace.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#edf7f6] border border-[#b0dcd5] text-[#0d3834] flex items-center justify-center font-black text-2xl shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#edf7f6] text-[#0d3834] border border-[#b0dcd5]">
                  Role: {user?.role}
                </span>
                <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Account Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shared Institution Field */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-slate-500" /> Institution / College
              </span>
              <p className="text-sm font-bold text-slate-800">
                {studentProfile?.institution ||
                  facultyProfile?.institution ||
                  adminProfile?.institution ||
                  'Apex Institute of Physiotherapy & Allied Sciences'}
              </p>
            </div>

            {/* ================= STUDENT PROFILE VIEW ================= */}
            {user?.role === 'student' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> Degree Course
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {studentProfile?.course || 'Bachelor of Physiotherapy (BPT)'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Academic Standing
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    Year {studentProfile?.academic_year || 1} • Semester {studentProfile?.semester || 1}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <IdCard className="w-3.5 h-3.5 text-slate-500" /> Student Enrollment ID
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {studentProfile?.enrollment_id || `BPT-${user?.id ? String(user.id).padStart(4, '0') : '0001'}`}
                  </p>
                </div>
              </>
            )}

            {/* ================= FACULTY PROFILE VIEW ================= */}
            {user?.role === 'faculty' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Department
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {facultyProfile?.department || 'Musculoskeletal & Orthopedics'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-slate-500" /> Designation
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {facultyProfile?.designation || 'Associate Professor'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Subjects / Areas Taught
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {facultyProfile?.subjects_taught || 'Biomechanics, Orthopedic Physiotherapy'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <IdCard className="w-3.5 h-3.5 text-slate-500" /> Faculty ID
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {facultyProfile?.faculty_id_number || `FAC-${user?.id ? String(user.id).padStart(3, '0') : '204'}`}
                  </p>
                </div>
              </>
            )}

            {/* ================= ADMIN PROFILE VIEW ================= */}
            {user?.role === 'admin' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Administrative Division
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {adminProfile?.department || 'Academic Affairs & Examination Council'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-slate-500" /> Admin Designation
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {adminProfile?.designation || 'Academic Administrator'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <IdCard className="w-3.5 h-3.5 text-slate-500" /> Employee / Admin ID
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {adminProfile?.employee_id || `ADM-${user?.id ? String(user.id).padStart(3, '0') : '001'}`}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ================= EDIT MODE FORM ================= */
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution / College</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                />
              </div>

              {/* Student fields */}
              {user?.role === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    >
                      <option value={1}>1st Year BPT</option>
                      <option value={2}>2nd Year BPT</option>
                      <option value={3}>3rd Year BPT</option>
                      <option value={4}>4th Year BPT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Enrollment ID</label>
                    <input
                      type="text"
                      value={enrollmentId}
                      onChange={(e) => setEnrollmentId(e.target.value)}
                      placeholder="e.g. BPT-2024-001"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>
                </>
              )}

              {/* Faculty fields */}
              {user?.role === 'faculty' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subjects Taught</label>
                    <input
                      type="text"
                      value={subjectsTaught}
                      onChange={(e) => setSubjectsTaught(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Faculty ID Number</label>
                    <input
                      type="text"
                      value={facultyIdNumber}
                      onChange={(e) => setFacultyIdNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>
                </>
              )}

              {/* Admin fields */}
              {user?.role === 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={adminDepartment}
                      onChange={(e) => setAdminDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admin Designation</label>
                    <input
                      type="text"
                      required
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#0d3834] text-white text-xs font-bold rounded-xl hover:bg-[#124b46] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
