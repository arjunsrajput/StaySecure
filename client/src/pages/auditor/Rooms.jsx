import React, { useEffect, useState } from 'react';
import { roomAPI } from '../../services/api';

const AuditorRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomAPI.getAllRooms();
        setRooms(response.data.rooms || []);
      } catch (error) {
        console.error('Failed to fetch auditor rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-6">Room Audit</h1>
        {loading ? (
          <div className="text-[#3C4044]/70">Loading rooms...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {rooms.map((room) => (
                    <tr key={room._id} className="bg-white hover:bg-[#fffaf6]">
                      <td className="px-6 py-4 text-[#3C4044] font-semibold">{room.roomNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{room.roomType?.name || '—'}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{room.capacity}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{room.status}</td>
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

export default AuditorRooms;
