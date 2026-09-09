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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 tracking-tight text-lg">PHYSIO<span className="text-teal-600 font-extrabold">-SMART</span></span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">BPT Adaptive Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  Curriculum & Topics
                </NavLink>

                <NavLink
                  to="/progress"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
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
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  Knowledge Base CMS
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
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <UserIcon className="w-4 h-4" />
              Academic Profile
            </NavLink>
          </nav>
        </div>

        {/* User Card & Logout in Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium text-slate-500">
              {isStudent && 'Student Learning Workspace'}
              {isFaculty && 'Faculty Verification Panel'}
              {isAdmin && 'System Administration Console'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Part 1: Foundation Active
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
