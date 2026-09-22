import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({ approvalMode: 'MANUAL' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data.settings || { approvalMode: 'MANUAL' });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleApprovalModeChange = async (mode) => {
    try {
      setSaving(true);
      await settingsAPI.updateSettings({ approvalMode: mode });
      setSettings((prev) => ({ ...prev, approvalMode: mode }));
    } catch (error) {
      console.error('Failed to update approval mode:', error);
      alert('Failed to update approval mode');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3C4044]">System Settings</h1>
          <p className="text-[#3C4044]/70 mt-1">Manage default operational settings for StaySecure.</p>
        </div>

        {loading ? (
          <div className="card-surface p-8 rounded-2xl text-[#3C4044]/70">Loading settings...</div>
        ) : (
          <div className="card-surface rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#3C4044]">Booking Approval</h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F3F1]">
                <input
                  type="radio"
                  name="approvalMode"
                  value="AUTOMATIC"
                  checked={settings.approvalMode === 'AUTOMATIC'}
                  onChange={() => handleApprovalModeChange('AUTOMATIC')}
                  className="mt-1 accent-[#FD7B41]"
                  disabled={saving}
                />
                <span className="text-[#3C4044]">
                  <strong>Automatic</strong> - Bookings auto-approved when the room is available.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F3F1]">
                <input
                  type="radio"
                  name="approvalMode"
                  value="MANUAL"
                  checked={settings.approvalMode === 'MANUAL'}
                  onChange={() => handleApprovalModeChange('MANUAL')}
                  className="mt-1 accent-[#FD7B41]"
                  disabled={saving}
                />
                <span className="text-[#3C4044]">
                  <strong>Manual</strong> - Approval Manager must review and approve each booking.
                </span>
              </label>
            </div>

            <div className="mt-8 border-t border-[#DDDCDB] pt-5 text-sm text-[#3C4044]/70">
              <p>Current mode: <strong className="text-[#3C4044]">{settings.approvalMode}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
