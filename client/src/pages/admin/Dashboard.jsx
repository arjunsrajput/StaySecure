import React, { useEffect, useState } from 'react';
import { bookingAPI, userAPI, roomAPI, settingsAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [approvalMode, setApprovalMode] = useState('MANUAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, roomsRes, bookingsRes, settingsRes] = await Promise.all([
        userAPI.getAllUsers(),
        roomAPI.getAllRooms(),
        bookingAPI.getAllBookings(),
        settingsAPI.getSettings(),
      ]);

      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalRooms: roomsRes.data.rooms?.length || 0,
        totalBookings: bookingsRes.data.bookings?.length || 0,
        pendingBookings: bookingsRes.data.bookings?.filter(b => b.approvalStatus === 'PENDING').length || 0,
      });

      setApprovalMode(settingsRes.data.settings?.approvalMode || 'MANUAL');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalModeChange = async (mode) => {
    try {
      await settingsAPI.updateSettings({ approvalMode: mode });
      setApprovalMode(mode);
      alert(`Approval mode changed to ${mode}`);
    } catch (error) {
      console.error('Failed to update approval mode:', error);
      alert('Failed to update approval mode');
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#3C4044]">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center text-[#3C4044]/70">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Users</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalUsers}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
                <p className="text-[#3C4044]/70 font-semibold">Total Rooms</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalRooms}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Bookings</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalBookings}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
                <p className="text-[#3C4044]/70 font-semibold">Pending Approvals</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.pendingBookings}</p>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#3C4044]">System Settings</h2>
              <div className="border-t border-[#DDDCDB] pt-4">
                <label className="block text-[#3C4044] font-semibold mb-4">
                  Booking Approval Mode
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F3F1]">
                    <input
                      type="radio"
                      name="approvalMode"
                      value="AUTOMATIC"
                      checked={approvalMode === 'AUTOMATIC'}
                      onChange={() => handleApprovalModeChange('AUTOMATIC')}
                      className="mt-1 accent-[#FD7B41]"
                    />
                    <span className="text-[#3C4044]">
                      <strong>Automatic</strong> - Bookings auto-approved if room available
                    </span>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F3F1]">
                    <input
                      type="radio"
                      name="approvalMode"
                      value="MANUAL"
                      checked={approvalMode === 'MANUAL'}
                      onChange={() => handleApprovalModeChange('MANUAL')}
                      className="mt-1 accent-[#FD7B41]"
                    />
                    <span className="text-[#3C4044]">
                      <strong>Manual</strong> - Approval Manager must approve each booking
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 border-l-4 border-[#FD7B41] bg-[#fffaf6]">
              <h3 className="font-bold text-[#3C4044] mb-2">ℹ️ Admin Information</h3>
              <ul className="text-sm text-[#3C4044]/80 space-y-1">
                <li>✓ Manage users and assign roles</li>
                <li>✓ Create and manage room types</li>
                <li>✓ View all bookings and payments</li>
                <li>✓ Change booking approval mode above</li>
                <li>✓ Access comprehensive reports</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
