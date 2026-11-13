import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleRoute } from '@/components/RequireAuth';
import ChatBot from '@/components/ChatBot';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardLayout from '@/layouts/DashboardLayout';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentSkills from '@/pages/student/StudentSkills';
import GapAnalysis from '@/pages/student/GapAnalysis';
import StudentJobs from '@/pages/student/StudentJobs';
import LearningResourcesPage from '@/pages/student/LearningResources';
import CompanyDashboard, {
  CompanyPostings,
  CompanyApplications,
} from '@/pages/company/CompanyDashboard';
import InstitutionDashboard, {
  InstitutionProfile,
  InstitutionStudents,
  InstitutionGaps,
} from '@/pages/institution/InstitutionDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="student" element={<RoleRoute role="student" />}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="skills" element={<StudentSkills />} />
              <Route path="gap-analysis" element={<GapAnalysis />} />
              <Route path="jobs" element={<StudentJobs />} />
              <Route path="resources" element={<LearningResourcesPage />} />
            </Route>

            <Route path="company" element={<RoleRoute role="company" />}>
              <Route index element={<CompanyDashboard />} />
              <Route path="postings" element={<CompanyPostings />} />
              <Route path="applications" element={<CompanyApplications />} />
            </Route>

            <Route path="institution" element={<RoleRoute role="institution" />}>
              <Route index element={<InstitutionDashboard />} />
              <Route path="profile" element={<InstitutionProfile />} />
              <Route path="students" element={<InstitutionStudents />} />
              <Route path="gaps" element={<InstitutionGaps />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatBot />
      </BrowserRouter>
    </AuthProvider>
  );
}
