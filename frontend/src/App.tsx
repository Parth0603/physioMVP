import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

// Public Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { SubjectsPage } from './pages/SubjectsPage';
import { SubjectDetailPage } from './pages/SubjectDetailPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AssessmentRunnerPage } from './pages/AssessmentRunnerPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSubjectsPage } from './pages/AdminSubjectsPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';

// Faculty Pages
import { FacultyDashboard } from './pages/FacultyDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Student Endpoints */}
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
            <Route path="topics/:topicId" element={<TopicDetailPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/:id" element={<AssessmentRunnerPage />} />
            <Route path="assessments/:id/result" element={<AssessmentResultPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Faculty Review Endpoints */}
            <Route
              path="faculty"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Endpoints */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/content"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminContentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/questions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminQuestionsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
