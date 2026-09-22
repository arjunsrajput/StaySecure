import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfile from './pages/customer/Profile';
import CustomerRoomsPage from './pages/customer/Rooms';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/Users';
import AdminRoomTypesPage from './pages/admin/RoomTypes';
import AdminRoomsPage from './pages/admin/Rooms';
import AdminBookingsPage from './pages/admin/Bookings';
import AdminSettingsPage from './pages/admin/Settings';
import ApprovalDashboard from './pages/approval/Dashboard';
import ApprovalPending from './pages/approval/Pending';
import ApprovalHistory from './pages/approval/History';
import AccountantDashboard from './pages/accountant/Dashboard';
import AccountantPayments from './pages/accountant/Payments';
import AccountantHistory from './pages/accountant/History';
import RoomManagerDashboard from './pages/room-manager/Dashboard';
import RoomManagerAllocations from './pages/room-manager/Allocations';
import AuditorDashboard from './pages/auditor/Dashboard';
import AuditorBookings from './pages/auditor/Bookings';
import AuditorRooms from './pages/auditor/Rooms';
import AuditorPayments from './pages/auditor/Payments';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistCheckIn from './pages/receptionist/CheckIn';
import ReceptionistCheckOut from './pages/receptionist/CheckOut';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDDCDB] text-[#3C4044] text-xl font-semibold">
        Loading session...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <div className={isAuthenticated ? 'flex-1' : 'w-full'}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/rooms"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerRoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/room-types"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminRoomTypesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminRoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/dashboard"
              element={
                <ProtectedRoute requiredRoles={['APPROVAL_MANAGER']}>
                  <ApprovalDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/pending"
              element={
                <ProtectedRoute requiredRoles={['APPROVAL_MANAGER']}>
                  <ApprovalPending />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/history"
              element={
                <ProtectedRoute requiredRoles={['APPROVAL_MANAGER']}>
                  <ApprovalHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/dashboard"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/payments"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantPayments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/history"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room-manager/dashboard"
              element={
                <ProtectedRoute requiredRoles={['ROOM_MANAGER']}>
                  <RoomManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room-manager/allocations"
              element={
                <ProtectedRoute requiredRoles={['ROOM_MANAGER']}>
                  <RoomManagerAllocations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/auditor/dashboard"
              element={
                <ProtectedRoute requiredRoles={['AUDITOR']}>
                  <AuditorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/auditor/bookings"
              element={
                <ProtectedRoute requiredRoles={['AUDITOR']}>
                  <AuditorBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/auditor/rooms"
              element={
                <ProtectedRoute requiredRoles={['AUDITOR']}>
                  <AuditorRooms />
                </ProtectedRoute>
              }
            />

            <Route
              path="/auditor/payments"
              element={
                <ProtectedRoute requiredRoles={['AUDITOR']}>
                  <AuditorPayments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/check-in"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST']}>
                  <ReceptionistCheckIn />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/check-out"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST']}>
                  <ReceptionistCheckOut />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
