import React, { useEffect, useState } from 'react';
import { bookingAPI, paymentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const AccountantPayments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordingId, setRecordingId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [message, setMessage] = useState({ type: '', text: '' });

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'CARD', label: 'Credit/Debit Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  ];

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const fetchApprovedBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      const approvedBookings = (response.data.bookings || []).filter(
        (b) => b.approvalStatus === 'APPROVED'
      );
      setBookings(approvedBookings);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load bookings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (bookingId) => {
    if (recordingId) return;

    setRecordingId(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const response = await paymentAPI.recordPayment({
        bookingId,
        paymentMethod: selectedMethod,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Payment recorded successfully.',
      });

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setSelectedMethod('CARD');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to record payment.',
      });
    } finally {
      setRecordingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.paymentStatus === 'PENDING');
  const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID');

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Record Payments</h1>
          <p className="text-[#3C4044]/70 mt-2">Process payments for approved bookings.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-surface p-4 rounded-2xl border-l-4 border-yellow-600">
            <p className="text-[#3C4044]/70 font-semibold">Pending Payments</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingBookings.length}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-emerald-600">
            <p className="text-[#3C4044]/70 font-semibold">Already Paid</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{paidBookings.length}</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80">
            <h2 className="text-xl font-bold text-[#3C4044]">Approved Bookings ({bookings.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No approved bookings to process.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Check-In</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Payment Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                      <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        <div className="text-sm">
                          <div className="font-medium">{booking.user?.name || 'N/A'}</div>
                          <div className="text-[#3C4044]/70">{booking.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[#3C4044]">
                        {formatDate(booking.checkInDate)}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#3C4044]">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.paymentStatus} />
                      </td>
                      <td className="px-6 py-4">
                        {booking.paymentStatus === 'PENDING' ? (
                          <button
                            onClick={() => setRecordingId(booking._id)}
                            disabled={recordingId === booking._id}
                            className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-sm font-semibold hover:bg-[#e76d35] disabled:opacity-60"
                          >
                            {recordingId === booking._id ? 'Recording...' : 'Record'}
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓ Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {recordingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-surface rounded-2xl p-8 max-w-md w-full space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#3C4044]">Record Payment</h2>
                <p className="text-[#3C4044]/70 mt-1">Select payment method and confirm.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3C4044] mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label key={method.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={selectedMethod === method.value}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-[#FD7B41]"
                      />
                      <span className="ml-3 text-[#3C4044]">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const booking = bookings.find((b) => b._id === recordingId);
                    handleRecordPayment(recordingId);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35]"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => setRecordingId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantPayments;
