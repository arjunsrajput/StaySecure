import React, { useEffect, useState } from 'react';
import { allocationAPI, bookingAPI, roomAPI } from '../../services/api';

const RoomManagerAllocations = () => {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes, allocationsRes] = await Promise.all([
        bookingAPI.getAllBookings(),
        roomAPI.getAllRooms(),
        allocationAPI.getAllAllocations(),
      ]);

      const approved = (bookingsRes.data.bookings || []).filter((b) => b.approvalStatus === 'APPROVED');
      setApprovedBookings(approved);
      setRooms(roomsRes.data.rooms || []);
      setAllocations(allocationsRes.data.allocations || []);
    } catch (error) {
      console.error('Failed to fetch room manager allocation data:', error);
      setMessage({ type: 'error', text: 'Failed to load allocation data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (bookingId) => {
    const room = rooms.find((r) => r.status === 'AVAILABLE' && r.roomType?._id === approvedBookings.find((b) => b._id === bookingId)?.roomType?._id);
    if (!room) {
      setMessage({ type: 'error', text: 'No matching available room for this approved booking.' });
      return;
    }

    try {
      const response = await allocationAPI.createAllocation({ bookingId, roomId: room._id });
      setMessage({ type: 'success', text: response.data.message || 'Room allocated successfully.' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to allocate room.' });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-6">Room Allocations</h1>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-[#3C4044]/70">Loading allocations...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {approvedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-[#3C4044]/70">No approved bookings need allocation.</td>
                    </tr>
                  ) : (
                    approvedBookings.map((booking) => {
                      const hasAllocation = allocations.some((allocation) => allocation.booking?._id === booking._id || allocation.booking === booking._id);
                      return (
                        <tr key={booking._id} className="bg-white hover:bg-[#fffaf6]">
                          <td className="px-6 py-4 text-[#3C4044] font-semibold">{booking.bookingNumber}</td>
                          <td className="px-6 py-4 text-[#3C4044]">{booking.user?.name || '—'}</td>
                          <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || '—'}</td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '—'}
                            <div className="text-xs text-[#3C4044]/60">to {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {hasAllocation ? (
                              <span className="text-sm text-emerald-700 font-semibold">Allocated</span>
                            ) : (
                              <button
                                onClick={() => handleAllocate(booking._id)}
                                className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-sm font-semibold hover:bg-[#e96e34]"
                              >
                                Allocate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagerAllocations;
