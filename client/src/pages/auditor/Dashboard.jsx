import React, { useEffect, useState } from 'react';
import { bookingAPI, paymentAPI, userAPI } from '../../services/api';

const AuditorDashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, payments: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, paymentsRes, usersRes] = await Promise.all([
          bookingAPI.getAllBookings(),
          paymentAPI.getAllPayments(),
          userAPI.getAllUsers(),
        ]);

        setStats({
          bookings: bookingsRes.data.bookings?.length || 0,
          payments: paymentsRes.data.payments?.length || 0,
          users: usersRes.data.users?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch auditor dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-8">Auditor Dashboard</h1>
        {loading ? (
          <div className="text-[#3C4044]/70">Loading data...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
              <p className="text-[#3C4044]/70 font-semibold">Total Bookings</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.bookings}</p>
            </div>
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
              <p className="text-[#3C4044]/70 font-semibold">Payment Records</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.payments}</p>
            </div>
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
              <p className="text-[#3C4044]/70 font-semibold">System Users</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.users}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;
