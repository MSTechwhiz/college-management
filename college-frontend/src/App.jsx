import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import DepartmentSelect from './pages/DepartmentSelect'
import AdminDashboard from './pages/admin/AdminDashboard'
import Departments from './pages/admin/Departments'
import DepartmentDetail from './pages/admin/DepartmentDetail'
import Students from './pages/admin/Students'
import StudentDetail from './pages/admin/StudentDetail'
import Faculty from './pages/admin/Faculty'
import Fees from './pages/admin/Fees'
import Admissions from './pages/admin/Admissions'
import Announcements from './pages/admin/Announcements'
import Reports from './pages/admin/Reports'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import StudentsByYear from './pages/faculty/StudentsByYear'
import Attendance from './pages/faculty/Attendance'
import Marks from './pages/faculty/Marks'
import StudentDashboard from './pages/student/StudentDashboard'
import FeesView from './pages/student/FeesView'
import AttendanceView from './pages/student/AttendanceView'
import MarksView from './pages/student/MarksView'
import AnnouncementsView from './pages/student/AnnouncementsView'
import ReportsCreate from './pages/student/ReportsCreate'
import NotAuthorized from './pages/NotAuthorized'
import ChatBot from './components/ChatBot'
import PrincipalDashboard from './pages/principal/PrincipalDashboard'

function App() {
  if (import.meta.env.MODE === 'production') {
    ['log', 'debug', 'warn'].forEach(k => {
      try { console[k] = () => {}; } catch {}
    })
  }
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-department" element={
            <ProtectedRoute>
              <DepartmentSelect />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/departments/:id" element={<DepartmentDetail />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/students/:registerNumber" element={<StudentDetail />} />
            <Route path="/admin/faculty" element={<Faculty />} />
            <Route path="/admin/fees" element={<Fees />} />
            <Route path="/admin/admissions" element={<Admissions />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>
          
          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={
            <ProtectedRoute role="FACULTY">
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/faculty/students/:year" element={
            <ProtectedRoute role="FACULTY">
              <StudentsByYear />
            </ProtectedRoute>
          } />
          <Route path="/faculty/attendance" element={
            <ProtectedRoute role="FACULTY">
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/faculty/marks" element={
            <ProtectedRoute role="FACULTY">
              <Marks />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/fees" element={
            <ProtectedRoute role="STUDENT">
              <FeesView />
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute role="STUDENT">
              <AttendanceView />
            </ProtectedRoute>
          } />
          <Route path="/student/marks" element={
            <ProtectedRoute role="STUDENT">
              <MarksView />
            </ProtectedRoute>
          } />
          <Route path="/student/announcements" element={
            <ProtectedRoute role="STUDENT">
              <AnnouncementsView />
            </ProtectedRoute>
          } />
          <Route path="/student/reports" element={
            <ProtectedRoute role="STUDENT">
              <ReportsCreate />
            </ProtectedRoute>
          } />
          
          {/* Principal Routes */}
          <Route path="/principal/dashboard" element={
            <ProtectedRoute role="PRINCIPAL">
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Routes>
        <ChatBot />
      </Router>
    </AuthProvider>
  )
}

export default App
