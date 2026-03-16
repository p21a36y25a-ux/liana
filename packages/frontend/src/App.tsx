import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import TimeTrackingPage from './pages/attendance/TimeTrackingPage';
import AttendancePage from './pages/attendance/AttendancePage';
import EmployeesPage from './pages/employees/EmployeesPage';
import LeavePage from './pages/leave/LeavePage';
import PayrollPage from './pages/payroll/PayrollPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/time-tracking" element={<TimeTrackingPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
