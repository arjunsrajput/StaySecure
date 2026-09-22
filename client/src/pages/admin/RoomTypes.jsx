import React, { useEffect, useState } from 'react';
import { roomTypeAPI } from '../../services/api';

const defaultForm = {
  name: 'HOSTEL',
  description: '',
  capacity: 1,
  pricePerDay: 0,
  isActive: true,
};

const roomTypeOptions = ['HOSTEL', 'PG', 'HOTEL', 'GUEST_ROOM', 'DORMITORY'];

const AdminRoomTypesPage = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRoomTypes = async () => {
    try {
      const response = await roomTypeAPI.getAllRoomTypes();
      setRoomTypes(response.data.roomTypes || []);
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load room types.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        pricePerDay: Number(form.pricePerDay),
      };

      if (editingId) {
        const response = await roomTypeAPI.updateRoomType(editingId, payload);
        setRoomTypes((prev) =>
          prev.map((item) => (item._id === editingId ? response.data.roomType : item))
        );
        setMessage({ type: 'success', text: 'Room type updated successfully.' });
      } else {
        const response = await roomTypeAPI.createRoomType(payload);
        setRoomTypes((prev) => [response.data.roomType, ...prev]);
        setMessage({ type: 'success', text: 'Room type created successfully.' });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save room type.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (roomType) => {
    setEditingId(roomType._id);
    setForm({
      name: roomType.name,
      description: roomType.description,
      capacity: roomType.capacity,
      pricePerDay: roomType.pricePerDay,
      isActive: roomType.isActive,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (roomTypeId) => {
    if (!window.confirm('Delete this room type?')) return;

    try {
      await roomTypeAPI.deleteRoomType(roomTypeId);
      setRoomTypes((prev) => prev.filter((item) => item._id !== roomTypeId));
      if (editingId === roomTypeId) {
        resetForm();
      }
      setMessage({ type: 'success', text: 'Room type deleted successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to delete room type.',
      });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3C4044]">Room Types</h1>
          <p className="text-[#3C4044]/70 mt-1">Manage room categories, capacity, and prices.</p>
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
              {editingId ? 'Edit Room Type' : 'Add Room Type'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Name</label>
                <select
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  {roomTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this room type"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Price / Day</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    min="0"
                    step="0.01"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-[#3C4044] font-medium">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="accent-[#FD7B41]"
                />
                Active
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="primary-btn px-4 py-2.5 rounded-lg font-bold disabled:opacity-60"
              >
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : editingId ? 'Update Room Type' : 'Create Room Type'}
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
              <div className="p-8 text-[#3C4044]/70">Loading room types...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DDDCDB]">
                  <thead className="bg-[#F5F3F1]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Capacity</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Price / Day</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDCDB]">
                    {roomTypes.map((roomType) => (
                      <tr key={roomType._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#3C4044]">{roomType.name}</div>
                          <div className="text-sm text-[#3C4044]/70 mt-1">{roomType.description}</div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">{roomType.capacity}</td>
                        <td className="px-6 py-4 text-[#3C4044]">₹{roomType.pricePerDay}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              roomType.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {roomType.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(roomType)}
                              className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-sm font-bold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(roomType._id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-bold"
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

export default AdminRoomTypesPage;
