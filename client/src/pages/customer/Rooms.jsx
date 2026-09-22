import React, { useEffect, useMemo, useState } from 'react';
import { roomAPI, roomTypeAPI, locationAPI, bookingAPI } from '../../services/api';
import { formatCurrency, calculateDays } from '../../utils/helpers';

const initialForm = {
  roomType: '',
  location: '',
  checkInDate: '',
  checkOutDate: '',
  numberOfGuests: 1,
};

const CustomerRooms = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const [roomTypesResponse, locationsResponse] = await Promise.all([
          roomTypeAPI.getAllRoomTypes(),
          locationAPI.getLocations(),
        ]);
        const availableRoomTypes = roomTypesResponse.data.roomTypes || [];
        const availableLocations = locationsResponse.data.locations || [];
        setRoomTypes(availableRoomTypes);
        setLocations(availableLocations);
        setForm((prev) => ({
          ...prev,
          roomType: availableRoomTypes[0]?._id || '',
          location: availableLocations[0]?._id || '',
        }));
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Unable to load room types right now.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const selectedRoomType = useMemo(
    () => roomTypes.find((roomType) => roomType._id === form.roomType) || null,
    [roomTypes, form.roomType]
  );

  const estimatedTotal = useMemo(() => {
    if (!selectedRoomType || !form.checkInDate || !form.checkOutDate) return 0;
    const days = Math.max(1, calculateDays(form.checkInDate, form.checkOutDate));
    return selectedRoomType.pricePerDay * days;
  }, [selectedRoomType, form.checkInDate, form.checkOutDate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? Number(value) : value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.roomType || !form.checkInDate || !form.checkOutDate) {
      setMessage({ type: 'error', text: 'Please select a room type and check-in/check-out dates.' });
      return;
    }

    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) {
      setMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }

    setSearching(true);
    try {
      const response = await roomAPI.getAvailableRooms(
        form.roomType,
        form.location,
        form.checkInDate,
        form.checkOutDate,
        form.numberOfGuests
      );

      setAvailableRooms(response.data.rooms || []);
      if (!response.data.rooms?.length) {
        setMessage({ type: 'info', text: 'No rooms are available for the selected dates.' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to search rooms.',
      });
      setAvailableRooms([]);
    } finally {
      setSearching(false);
    }
  };

  const handleBooking = async (roomId) => {
    if (!form.roomType || !form.checkInDate || !form.checkOutDate) {
      setMessage({ type: 'error', text: 'Please complete the booking details before submitting.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await bookingAPI.createBooking({
        roomType: form.roomType,
        location: form.location,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numberOfGuests: form.numberOfGuests,
        roomId,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Booking request created successfully.',
      });
      setAvailableRooms([]);
      setForm((prev) => ({ ...prev, checkInDate: '', checkOutDate: '' }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Booking could not be created.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#3C4044]">Search Rooms</h1>
            <p className="text-[#3C4044]/70 mt-2">Find the best room for your stay.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="card-surface rounded-2xl p-6 space-y-5">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                required={locations.length > 0}
              >
                {locations.length === 0 ? <option value="">All locations</option> : null}
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name} - {location.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
              >
                {roomTypes.map((roomType) => (
                  <option key={roomType._id} value={roomType._id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Check-In</label>
              <input
                type="date"
                name="checkInDate"
                value={form.checkInDate}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Check-Out</label>
              <input
                type="date"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3C4044] mb-2">Guests</label>
              <input
                type="number"
                name="numberOfGuests"
                min="1"
                max={selectedRoomType?.capacity || 20}
                value={form.numberOfGuests}
                onChange={handleChange}
                className="w-full border border-[#DDDCDB] rounded-xl px-3 py-2.5 bg-white text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-[#3C4044]/70">
              {selectedRoomType ? (
                <>Estimated total: <span className="font-semibold text-[#3C4044]">{formatCurrency(estimatedTotal || selectedRoomType.pricePerDay)}</span> for selected dates</>
              ) : 'Select a room type to estimate the price.'}
            </div>
            <button
              type="submit"
              disabled={searching || loading}
              className="px-5 py-2.5 rounded-xl bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35] disabled:opacity-60"
            >
              {searching ? 'Searching...' : 'Check Availability'}
            </button>
          </div>
        </form>

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
            <h2 className="text-xl font-bold text-[#3C4044]">Available Rooms</h2>
          </div>

          {availableRooms.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No rooms to display yet. Search for a stay to see available options.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
              {availableRooms.map((room) => (
                <div key={room._id} className="border border-[#DDDCDB] rounded-2xl p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#3C4044]">{room.roomNumber}</h3>
                    <span className="px-2 py-1 bg-[#EDBF9B] text-[#3C4044] text-xs font-semibold rounded-full">
                      {room.roomType?.name}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#3C4044]/70">
                    <p>Floor: {room.floor}</p>
                    <p>Capacity: {room.capacity} guests</p>
                    <p>Price: {formatCurrency(room.roomType?.pricePerDay || 0)} / night</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBooking(room._id)}
                    disabled={submitting}
                    className="mt-5 w-full px-4 py-2.5 rounded-xl bg-[#3C4044] text-white font-semibold hover:bg-[#2b2f33] disabled:opacity-60"
                  >
                    {submitting ? 'Booking...' : 'Book This Room'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRooms;
