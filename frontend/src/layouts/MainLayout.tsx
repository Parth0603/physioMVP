import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  BarChart2,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  FileCheck,
  GraduationCap,
  Sparkles,
  Stethoscope,
  Menu,
  X,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';

  // Helper for NavLink active styling
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#edf7f6] text-[#0d3834] font-bold shadow-xs'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
    }`;

  const navLinksContent = (
    <>
      {/* Student Navigation */}
      {(isStudent || isAdmin) && (
        <div className="space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Learning
          </div>
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4 text-[#0d3834]" />
            Dashboard
          </NavLink>

          <NavLink to="/subjects" className={navLinkClass}>
            <BookOpen className="w-4 h-4 text-[#0d3834]" />
            Curriculum & Topics
          </NavLink>

          <NavLink to="/assessments" className={navLinkClass}>
            <FileCheck className="w-4 h-4 text-[#0d3834]" />
            Diagnostic Tests
          </NavLink>

          <NavLink to="/practice" className={navLinkClass}>
            <Stethoscope className="w-4 h-4 text-[#0d3834]" />
            Practice & Cases
          </NavLink>

          <NavLink to="/progress" className={navLinkClass}>
            <BarChart2 className="w-4 h-4 text-[#0d3834]" />
            My Mastery
          </NavLink>
        </div>
      )}

      {/* Faculty Section */}
      {(isFaculty || isAdmin) && (
        <div className="space-y-1 pt-2">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Faculty
          </div>
          <NavLink to="/faculty" className={navLinkClass}>
            <FileCheck className="w-4 h-4 text-[#0d3834]" />
            Content Verification
          </NavLink>
        </div>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <div className="space-y-1 pt-2">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Administration
          </div>
          <NavLink to="/admin" end className={navLinkClass}>
            <Shield className="w-4 h-4 text-[#0d3834]" />
            Admin Overview
          </NavLink>

          <NavLink to="/admin/subjects" className={navLinkClass}>
            <Layers className="w-4 h-4 text-[#0d3834]" />
            Curriculum Hierarchy
          </NavLink>

          <NavLink to="/admin/content" className={navLinkClass}>
            <BookOpen className="w-4 h-4 text-[#0d3834]" />
            Knowledge Base CMS
          </NavLink>

          <NavLink to="/admin/questions" className={navLinkClass}>
            <FileCheck className="w-4 h-4 text-[#0d3834]" />
            Question Repository
          </NavLink>
        </div>
      )}

      {/* Account Section */}
      <div className="space-y-1 pt-2">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account
        </div>
        <NavLink to="/profile" className={navLinkClass}>
          <UserIcon className="w-4 h-4 text-[#0d3834]" />
          Academic Profile
        </NavLink>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden">
      {/* ========================================================================= */}
      {/* MOBILE STICKY TOP NAVIGATION BAR (< md) */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-5 sm:px-6 h-20 flex items-center justify-between shrink-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0d3834] to-[#155952] flex items-center justify-center text-[#2dd4bf] font-bold shadow-md shadow-[#0d3834]/15 ring-1 ring-white/50">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[#0d3834] tracking-tight text-lg leading-tight">
              PHYSIO<span className="text-[#14b8a6] font-extrabold">-SMART</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              BPT Adaptive Platform
            </span>
          </div>
        </div>

        {/* Right side: Role pill & Mobile menu toggle button */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#edf7f6]/90 text-[#0d3834] border border-[#b0dcd5] capitalize shadow-2xs">
            {user?.role}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 flex items-center justify-center active:scale-95 transition-all shadow-2xs border border-slate-200/60 focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (< md) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-20 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d3834] to-[#155952] flex items-center justify-center text-[#2dd4bf] font-bold shadow-md shadow-[#0d3834]/15">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-[#0d3834] tracking-tight text-base leading-tight">
                    PHYSIO<span className="text-[#14b8a6] font-extrabold">-SMART</span>
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                    Adaptive Workspace
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navLinksContent}
            </nav>

            {/* Drawer Footer with User details & Logout */}
            <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50/80">
              <div className="flex items-center justify-between gap-2">
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-9 h-9 rounded-full bg-[#edf7f6] border border-slate-200 flex items-center justify-center font-bold text-[#0d3834] text-xs shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                    <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-500 font-medium capitalize border border-slate-200">
                      {user?.role}
                    </span>
                  </div>
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR NAVIGATION (md:) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen shrink-0 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#0d3834] flex items-center justify-center text-[#2dd4bf] font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[#0d3834] tracking-tight text-lg">
              PHYSIO<span className="text-[#14b8a6] font-extrabold">-SMART</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              BPT Adaptive Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navLinksContent}
        </nav>

        {/* Desktop User Footer Card */}
        <div className="shrink-0 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-85 transition-opacity flex-1 min-w-0"
              title="View Academic Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#edf7f6] border border-slate-200 flex items-center justify-center font-bold text-[#0d3834] text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </NavLink>

            <div className="flex items-center gap-1 shrink-0">
              <NavLink
                to="/profile"
                title="Academic Profile"
                className={({ isActive }) =>
                  `p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#edf7f6] text-[#0d3834]'
                      : 'text-slate-400 hover:text-[#0d3834] hover:bg-slate-100'
                  }`
                }
              >
                <UserIcon className="w-4 h-4" />
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-auto md:h-screen overflow-hidden">
        {/* Top Header - Desktop Only */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-6 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-slate-600">
              {isStudent && 'Student Learning Workspace'}
              {isFaculty && 'Faculty Verification Panel'}
              {isAdmin && 'System Administration Console'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#edf7f6] text-[#0d3834] border border-[#b0dcd5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse"></span>
              PHYSIO-SMART Platform Active
            </span>
          </div>
        </header>

        {/* Page Viewport - Generous bottom padding to clear floating island pill */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-28 sm:pb-32 md:pb-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* ========================================================================= */}
        {/* MOBILE FLOATING ISLAND PILL NAVBAR (< md) */}
        {/* iOS-Style Glassy Floating Island Pill */}
        {/* ========================================================================= */}
        <div className="md:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
          <nav className="pointer-events-auto w-full max-w-sm bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_12px_36px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] rounded-full px-2 py-1.5 flex items-center justify-around ring-1 ring-black/[0.04]">
            {isStudent && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/subjects"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Subjects</span>
                </NavLink>

                <NavLink
                  to="/assessments"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Tests</span>
                </NavLink>

                <NavLink
                  to="/practice"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <Stethoscope className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Practice</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <UserIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Profile</span>
                </NavLink>
              </>
            )}

            {isFaculty && (
              <>
                <NavLink
                  to="/faculty"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Verification</span>
                </NavLink>

                <NavLink
                  to="/subjects"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Curriculum</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <UserIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Profile</span>
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <Shield className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Console</span>
                </NavLink>

                <NavLink
                  to="/admin/subjects"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <Layers className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Curriculum</span>
                </NavLink>

                <NavLink
                  to="/admin/content"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">CMS</span>
                </NavLink>

                <NavLink
                  to="/admin/questions"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Questions</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0d3834] text-white shadow-xs font-bold scale-102'
                        : 'text-slate-500 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <UserIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-tight">Profile</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
