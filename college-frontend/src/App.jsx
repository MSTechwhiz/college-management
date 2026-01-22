import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-department" element={
            <ProtectedRoute>
              <DepartmentSelect />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute role="ADMIN">
              <Departments />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments/:id" element={
            <ProtectedRoute role="ADMIN">
              <DepartmentDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="ADMIN">
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/:registerNumber" element={
            <ProtectedRoute role="ADMIN">
              <StudentDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/faculty" element={
            <ProtectedRoute role="ADMIN">
              <Faculty />
            </ProtectedRoute>
          } />
          <Route path="/admin/fees" element={
            <ProtectedRoute role="ADMIN">
              <Fees />
            </ProtectedRoute>
          } />
          <Route path="/admin/admissions" element={
            <ProtectedRoute role="ADMIN">
              <Admissions />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute role="ADMIN">
              <Announcements />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute role="ADMIN">
              <Reports />
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ChatBot />
      </Router>
    </AuthProvider>
  )
}

export default App
