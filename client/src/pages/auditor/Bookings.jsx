import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';

const AuditorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getAllBookings();
        setBookings(response.data.bookings || []);
      } catch (error) {
        console.error('Failed to fetch auditor bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-6">Booking Audit</h1>
        {loading ? (
          <div className="text-[#3C4044]/70">Loading bookings...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Approval</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="bg-white hover:bg-[#fffaf6]">
                      <td className="px-6 py-4 text-[#3C4044] font-semibold">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.user?.name || '—'}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.approvalStatus}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.bookingStatus}</td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditorBookings;
