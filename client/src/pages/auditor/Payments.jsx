import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../services/api';

const AuditorPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentAPI.getAllPayments();
        setPayments(response.data.payments || []);
      } catch (error) {
        console.error('Failed to fetch auditor payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-6">Payment Audit</h1>
        {loading ? (
          <div className="text-[#3C4044]/70">Loading payments...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="bg-white hover:bg-[#fffaf6]">
                      <td className="px-6 py-4 text-[#3C4044] font-semibold">{payment.booking?.bookingNumber || '—'}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{payment.amount}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{payment.status}</td>
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

export default AuditorPayments;
