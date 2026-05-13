import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import api from '../services/api';
import { tw } from '../theme';
import { FiPlus, FiX, FiTrash2 } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate';
      await api.patch(`/users/${userId}/${endpoint}`);
      fetchUsers();
    } catch { alert('Failed to update user status'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(userId);
      fetchUsers();
    } catch { alert('Failed to delete user'); }
  };

  const getRoleBadge = (role) => ({
    admin:   'bg-[#f26522]/10 text-[#f26522]',
    teacher: 'bg-[#1a237e]/10 text-[#1a237e]',
    student: 'bg-green-100 text-green-800',
  }[role] || 'bg-gray-100 text-gray-800');

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;
    return true;
  });

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
            <h1 className="text-3xl font-bold text-[#1a237e]">User Management</h1>
            <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
            <p className="mt-2 text-gray-500">Manage system users and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${tw.btnAccent} px-5 py-2.5 text-sm flex items-center gap-2`}
          >
            <FiPlus className="w-4 h-4" /> Create User
          </button>
        </div>

        {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

        <div className={`${tw.card} mb-6 p-4`}>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`${tw.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1a237e]">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-[#f5f5f5] transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#1a237e] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {user.name.charAt(0)}{user.surname.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name} {user.surname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleActive(user._id, user.is_active)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className={user.is_active ? 'text-yellow-500 hover:text-yellow-700 transition' : 'text-green-600 hover:text-green-800 transition'}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {user.is_active
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            }
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                          className="text-red-500 hover:text-red-800 transition"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="bg-[#1a237e] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Create New User</h2>
            <div className="w-6 h-0.5 bg-[#f26522] mt-1 rounded-full" />
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={tw.input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" required value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className={tw.input} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={tw.input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={tw.input} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={tw.select}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className={`${tw.btnOutline} flex-1 py-2 text-sm`}>Cancel</button>
              <button type="submit" disabled={loading} className={`${tw.btnPrimary} flex-1 py-2 text-sm disabled:opacity-50`}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;