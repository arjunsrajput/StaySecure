import React, { useEffect, useState } from 'react';
import { roomAPI, roomTypeAPI, locationAPI } from '../../services/api';

const defaultForm = {
  roomNumber: '',
  roomType: '',
  location: '',
  floor: 1,
  capacity: 1,
  status: 'AVAILABLE',
};

const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'BLOCKED'];

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [roomsRes, roomTypesRes, locationsRes] = await Promise.all([
        roomAPI.getAllRooms(),
        roomTypeAPI.getAllRoomTypes(),
        locationAPI.getAllLocations(),
      ]);

      setRooms(roomsRes.data.rooms || []);
      setRoomTypes(roomTypesRes.data.roomTypes || []);
      setLocations(locationsRes.data.locations || []);
      if (!form.roomType && (roomTypesRes.data.roomTypes || []).length > 0) {
        setForm((prev) => ({
          ...prev,
          roomType: roomTypesRes.data.roomTypes[0]._id,
          location: locationsRes.data.locations?.[0]?._id || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch rooms data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load rooms.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      roomNumber: '',
      roomType: roomTypes[0]?._id || '',
      location: locations[0]?._id || '',
      floor: 1,
      capacity: 1,
      status: 'AVAILABLE',
    });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
      };

      if (editingId) {
        const response = await roomAPI.updateRoom(editingId, payload);
        setRooms((prev) =>
          prev.map((room) => (room._id === editingId ? response.data.room : room))
        );
        setMessage({ type: 'success', text: 'Room updated successfully.' });
      } else {
        const response = await roomAPI.createRoom(payload);
        setRooms((prev) => [response.data.room, ...prev]);
        setMessage({ type: 'success', text: 'Room created successfully.' });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save room.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType?._id || room.roomType || '',
      location: room.location?._id || room.location || '',
      floor: room.floor,
      capacity: room.capacity,
      status: room.status,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;

    try {
      await roomAPI.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
      if (editingId === roomId) {
        resetForm();
      }
      setMessage({ type: 'success', text: 'Room deleted successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to delete room.',
      });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3C4044]">Room Management</h1>
          <p className="text-[#3C4044]/70 mt-1">Create and manage room inventory across categories.</p>
        </div>

        {message.text && (
          <div
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#3C4044] mb-5">
              {editingId ? 'Edit Room' : 'Add Room'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  placeholder="H-101"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Room Type</label>
                <select
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                >
                  {roomTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Floor</label>
                  <input
                    type="number"
                    name="floor"
                    min="1"
                    value={form.floor}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  {roomStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="primary-btn px-4 py-2.5 rounded-lg font-bold disabled:opacity-60"
              >
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : editingId ? 'Update Room' : 'Create Room'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-lg border border-[#DDDCDB] bg-white text-[#3C4044] font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="card-surface rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-[#3C4044]/70">Loading rooms...</div>
            ) : (
              <div className="w-full">
                <table className="w-full table-fixed divide-y divide-[#DDDCDB] text-xs">
                  <thead className="bg-[#F5F3F1]">
                    <tr>
                      <th className="w-[13%] px-2 py-3 text-left font-bold text-[#3C4044]">Room</th>
                      <th className="w-[16%] px-2 py-3 text-left font-bold text-[#3C4044]">Type</th>
                      <th className="w-[20%] px-2 py-3 text-left font-bold text-[#3C4044]">Location</th>
                      <th className="w-[8%] px-2 py-3 text-left font-bold text-[#3C4044]">Floor</th>
                      <th className="w-[11%] px-2 py-3 text-left font-bold text-[#3C4044]">Capacity</th>
                      <th className="w-[14%] px-2 py-3 text-left font-bold text-[#3C4044]">Status</th>
                      <th className="w-[18%] px-2 py-3 text-left font-bold text-[#3C4044]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDCDB]">
                    {rooms.map((room) => (
                      <tr key={room._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="break-words px-2 py-3 font-bold text-[#3C4044]">{room.roomNumber}</td>
                        <td className="break-words px-2 py-3 text-[#3C4044]">{room.roomType?.name || room.roomType}</td>
                        <td className="break-words px-2 py-3 text-[#3C4044]">{room.location?.name || 'Unassigned'}</td>
                        <td className="px-2 py-3 text-[#3C4044]">{room.floor}</td>
                        <td className="px-2 py-3 text-[#3C4044]">{room.capacity}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              room.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : room.status === 'OCCUPIED'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(room)}
                              className="px-2 py-1 rounded-md bg-[#FD7B41] text-white text-[10px] font-bold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(room._id)}
                              className="px-2 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomsPage;
