import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Building,
  Shield,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  // Step tracker (1 or 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  // Step 2: Shared & Role-Specific Fields
  const [institution, setInstitution] = useState('');
  // Student fields
  const [course, setCourse] = useState('Bachelor of Physiotherapy (BPT)');
  const [academicYear, setAcademicYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [enrollmentId, setEnrollmentId] = useState('');

  // Faculty fields
  const [department, setDepartment] = useState('Musculoskeletal & Orthopedics');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [subjectsTaught, setSubjectsTaught] = useState('Biomechanics & Kinesiology, Orthopedics');
  const [facultyIdNumber, setFacultyIdNumber] = useState('');

  // Admin fields
  const [adminDepartment, setAdminDepartment] = useState('Academic Affairs & Examination Council');
  const [adminDesignation, setAdminDesignation] = useState('Academic Administrator');
  const [employeeId, setEmployeeId] = useState('');

  // UI States
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate Step 1 before proceeding
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setStep(2);
  };

  // Submit complete registration on Step 2
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!institution.trim()) {
      setError('Please specify your Institution / College.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        institution: institution.trim(),
      };

      if (role === 'student') {
        payload.course = course;
        payload.academic_year = academicYear;
        payload.semester = semester;
        payload.enrollment_id = enrollmentId.trim() || undefined;
      } else if (role === 'faculty') {
        payload.department = department.trim();
        payload.designation = designation.trim();
        payload.subjects_taught = subjectsTaught.trim();
        payload.faculty_id_number = facultyIdNumber.trim() || undefined;
      } else if (role === 'admin') {
        payload.department = adminDepartment.trim();
        payload.designation = adminDesignation.trim();
        payload.employee_id = employeeId.trim() || undefined;
      }

      const res = await register(payload);

      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'faculty') navigate('/faculty');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Registration failed. Please verify your details or check if email is already registered.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0d3834] text-[#2dd4bf] shadow-sm mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#0d3834] tracking-tight">
            PHYSIO<span className="text-[#14b8a6]">-SMART</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            BPT Adaptive Learning & Competency Workspace
          </p>
        </div>

        {/* Multi-step Stepper Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 1
                  ? 'bg-[#0d3834] text-white shadow-sm'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">Account Details</span>
          </div>
          <div className="flex-1 h-0.5 mx-2 sm:mx-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 2
                  ? 'bg-[#0d3834] text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span
              className={`text-[11px] sm:text-xs font-bold truncate ${
                step === 2 ? 'text-slate-800' : 'text-slate-400'
              }`}
            >
              {role === 'student' ? 'Student Info' : role === 'faculty' ? 'Faculty Info' : 'Admin Info'}
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <form onSubmit={handleProceedToStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@physiosmart.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all"
                />
                <span className="block text-[11px] text-slate-400 mt-1">Must be at least 6 characters</span>
              </div>

              {/* Role Selection Cards */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-1.5 ${
                      role === 'student'
                        ? 'border-[#0d3834] bg-[#edf7f6] text-[#0d3834] ring-2 ring-[#0d3834]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-[#14b8a6]" />
                    <span className="text-xs font-bold">Student</span>
                    <span className="text-[10px] text-slate-400 leading-tight">BPT Candidate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-1.5 ${
                      role === 'faculty'
                        ? 'border-[#0d3834] bg-[#edf7f6] text-[#0d3834] ring-2 ring-[#0d3834]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold">Faculty</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Professor/HOD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-1.5 ${
                      role === 'admin'
                        ? 'border-[#0d3834] bg-[#edf7f6] text-[#0d3834] ring-2 ring-[#0d3834]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold">Admin</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Institution Lead</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0d3834] text-white text-sm font-bold hover:bg-[#124b46] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Role Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ================= STEP 2: ROLE SPECIFIC ================= */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14b8a6]">
                    Step 2 of 2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {role === 'student' && 'BPT Academic Information'}
                    {role === 'faculty' && 'Faculty Department & Subject Information'}
                    {role === 'admin' && 'Institutional Administrative Details'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0d3834]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {/* Institution (all roles) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution / College <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Apex Institute of Physiotherapy & Allied Sciences"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Year <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] bg-white font-medium"
                      >
                        <option value={1}>1st Year BPT</option>
                        <option value={2}>2nd Year BPT</option>
                        <option value={3}>3rd Year BPT</option>
                        <option value={4}>4th Year BPT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Semester <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] bg-white font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degree / Course
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student / Enrollment ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={enrollmentId}
                      onChange={(e) => setEnrollmentId(e.target.value)}
                      placeholder="e.g. BPT-2024-001"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                    />
                  </div>
                </>
              )}

              {/* FACULTY FIELDS */}
              {role === 'faculty' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Musculoskeletal & Orthopedics"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Designation <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] bg-white font-medium"
                      >
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor & HOD">Professor & HOD</option>
                        <option value="Clinical Instructor">Clinical Instructor</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Faculty ID Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={facultyIdNumber}
                        onChange={(e) => setFacultyIdNumber(e.target.value)}
                        placeholder="e.g. FAC-204"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subjects / Areas Taught
                    </label>
                    <input
                      type="text"
                      value={subjectsTaught}
                      onChange={(e) => setSubjectsTaught(e.target.value)}
                      placeholder="e.g. Biomechanics, Kinesiology, Orthopedics"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                    />
                  </div>
                </>
              )}

              {/* ADMIN FIELDS */}
              {role === 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrative Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminDepartment}
                      onChange={(e) => setAdminDepartment(e.target.value)}
                      placeholder="e.g. Academic Affairs & Examination Council"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Admin Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminDesignation}
                        onChange={(e) => setAdminDesignation(e.target.value)}
                        placeholder="e.g. Dean / Administrator"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employee ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. ADM-001"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-3 px-4 rounded-xl bg-[#0d3834] text-white text-xs font-bold hover:bg-[#124b46] shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <UserCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">Already have an account? </span>
            <Link
              to="/login"
              className="text-xs font-bold text-[#14b8a6] hover:text-[#0d9488] underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
