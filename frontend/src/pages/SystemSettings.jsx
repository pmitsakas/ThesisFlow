import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { tw } from '../theme';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data.data);
      setError('');
    } catch { setError('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleInitialize = async () => {
    try {
      await api.post('/settings/initialize');
      setSuccess('Settings initialized successfully');
      fetchSettings();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to initialize settings'); }
  };

  const handleEdit = (setting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value !== null ? setting.value.toString() : '');
  };

  const handleSave = async (key) => {
    try {
      let value = editValue;
      if (editValue === 'true') value = true;
      else if (editValue === 'false') value = false;
      else if (!isNaN(editValue) && editValue !== '') value = Number(editValue);
      else if (editValue === '' || editValue === 'null') value = null;
      await api.put(`/settings/${key}`, { value });
      setSuccess('Setting updated successfully');
      setEditingKey(null);
      fetchSettings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.error?.message || 'Failed to update setting'); }
  };

  const handleCancel = () => { setEditingKey(null); setEditValue(''); };

  const getValueDisplay = (value) => {
    if (value === null) return <span className="text-gray-400 italic">Not set</span>;
    if (typeof value === 'boolean') return value
      ? <span className="text-green-600 font-semibold">Enabled</span>
      : <span className="text-red-500 font-semibold">Disabled</span>;
    if (typeof value === 'string' && value.includes('T')) {
      return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return <span className="font-semibold text-[#1a237e]">{value}</span>;
  };

  const getSettingIcon = (key) => {
    if (key.includes('DEADLINE')) return (
      <svg className="w-5 h-5 text-[#f26522]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
    if (key.includes('MAX')) return (
      <svg className="w-5 h-5 text-[#1565c0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
    if (key.includes('ALLOW') || key.includes('ENABLE') || key.includes('AUTO')) return (
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
    return (
      <svg className="w-5 h-5 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1a237e]">System Settings</h1>
            <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
            <p className="mt-2 text-gray-500">Configure system-wide parameters and defaults</p>
          </div>
          {settings.length === 0 && (
            <button onClick={handleInitialize} className={`${tw.btnAccent} px-5 py-2.5 text-sm`}>
              Initialize Settings
            </button>
          )}
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}
        {success && <div className={`${tw.alertSuccess} mb-4`}>{success}</div>}

        {settings.length === 0 ? (
          <div className={`${tw.card} p-12 text-center`}>
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-[#1a237e] mb-2">No settings found</h3>
            <p className="text-gray-500 mb-6">Initialize the default system settings to get started</p>
            <button onClick={handleInitialize} className={`${tw.btnPrimary} px-6 py-2.5 text-sm`}>
              Initialize Default Settings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settings.map(setting => (
              <div key={setting.key} className={`${tw.cardHover} overflow-hidden`}>
                <div className="bg-[#1a237e] px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getSettingIcon(setting.key)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{setting.key.replace(/_/g, ' ')}</h3>
                    {setting.description && <p className="text-xs text-blue-200 mt-0.5">{setting.description}</p>}
                  </div>
                </div>

                <div className="p-5">
                  {editingKey === setting.key ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className={tw.input}
                        placeholder="Enter value (true/false/number/text/null)"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(setting.key)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium">
                          Save
                        </button>
                        <button onClick={handleCancel} className={`${tw.btnOutline} flex-1 py-2 text-sm`}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{getValueDisplay(setting.value)}</div>
                      <button onClick={() => handleEdit(setting)} className="text-[#1a237e] hover:text-[#f26522] transition" title="Edit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {setting.updated_at && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Last updated: {new Date(setting.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-[#1a237e] rounded-xl p-6 text-white">
          <h3 className="text-sm font-semibold mb-1">About System Settings</h3>
          <div className="w-6 h-0.5 bg-[#f26522] mb-3 rounded-full" />
          <p className="text-sm text-blue-200 mb-2">System settings affect the entire application. Changes take effect immediately.</p>
          <ul className="text-sm text-blue-200 list-disc list-inside space-y-1">
            <li><span className="text-white font-medium">Global Deadline:</span> Default deadline for all new dissertations</li>
            <li><span className="text-white font-medium">Warning Days:</span> Days before deadline to show warnings</li>
            <li><span className="text-white font-medium">Max per Teacher:</span> Maximum dissertations a teacher can supervise</li>
            <li><span className="text-white font-medium">Allow Proposals:</span> Whether students can propose topics</li>
            <li><span className="text-white font-medium">Auto Approve:</span> Automatically approve new teacher accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;