import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Navigation - Fixed to screen */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen shrink-0 overflow-hidden">
        {/* Brand Header - Fixed at top */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#0d3834] flex items-center justify-center text-[#2dd4bf] font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[#0d3834] tracking-tight text-lg">PHYSIO<span className="text-[#14b8a6] font-extrabold">-SMART</span></span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">BPT Adaptive Platform</span>
          </div>
        </div>

        {/* Navigation Links - Only this remaining part scrolls if needed */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {/* Student Navigation */}
            {(isStudent || isAdmin) && (
              <>
                <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Learning
                </div>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/subjects"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  Curriculum & Topics
                </NavLink>

                <NavLink
                  to="/assessments"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4" />
                  Diagnostic Tests
                </NavLink>

                <NavLink
                  to="/practice"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Stethoscope className="w-4 h-4" />
                  Practice & Cases
                </NavLink>

                <NavLink
                  to="/progress"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <BarChart2 className="w-4 h-4" />
                  My Mastery
                </NavLink>
              </>
            )}

            {/* Faculty Section */}
            {(isFaculty || isAdmin) && (
              <>
                <div className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Faculty Review
                </div>
                <NavLink
                  to="/faculty"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4" />
                  Content Verification
                </NavLink>
              </>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </div>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Shield className="w-4 h-4" />
                  Admin Overview
                </NavLink>

                <NavLink
                  to="/admin/subjects"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Layers className="w-4 h-4" />
                  Curriculum Hierarchy
                </NavLink>

                <NavLink
                  to="/admin/content"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  Knowledge Base CMS
                </NavLink>

                <NavLink
                  to="/admin/questions"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <FileCheck className="w-4 h-4" />
                  Question Repository
                </NavLink>
              </>
            )}

            <div className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </div>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#edf7f6] text-[#0d3834] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <UserIcon className="w-4 h-4" />
              Academic Profile
            </NavLink>
          </nav>

        {/* User Card, Profile & Logout in Footer - Always Fixed at Bottom */}
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
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
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

        {/* Page Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
