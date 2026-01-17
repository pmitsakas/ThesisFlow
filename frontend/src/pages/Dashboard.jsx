import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiUsers, FiBookOpen, FiLock, FiClock, FiUser } from 'react-icons/fi';
import { FiSearch, FiFileText } from 'react-icons/fi';
import { FiUsers as FiUsersIcon, FiSettings } from 'react-icons/fi';

const Dashboard = () => {
  const { user, hasActiveDissertation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back to your workspace</p>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.name} {user?.surname}
                    </h2>
                    <p className="text-blue-100 mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">User ID</span>
                    <span className="text-sm text-gray-900 font-mono">{user?._id}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                    <span className="text-sm text-gray-900">{user?.name} {user?.surname}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Email</span>
                    <span className="text-sm text-gray-900">{user?.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Role</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Account Status</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user?.is_active)}`}>
                      {user?.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  {user?.role === 'teacher' && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Approval Status</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`
            space-y-6 
            fixed lg:static inset-y-0 right-0 z-40
            w-80 lg:w-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className="bg-white shadow-lg rounded-lg p-6 h-full lg:h-auto overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {user?.role === 'student' && (
                  <>
                    {hasActiveDissertation ? (
                      <>
                        <div className="relative">
                          <div className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between opacity-60 cursor-not-allowed">
                            <div className="flex items-center">
                              <FiLock className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-gray-500">Browse Topics</span>
                                <p className="text-xs text-gray-400 mt-0.5">You already have an assigned dissertation</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between opacity-60 cursor-not-allowed">
                            <div className="flex items-center">
                              <FiLock className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-gray-500">Propose Topic</span>
                                <p className="text-xs text-gray-400 mt-0.5">You already have an assigned dissertation</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <a
                          href="/student/profile"
                          className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center"
                        >
                          <FiUser className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="text-sm font-medium text-gray-700">My Profile</span>
                        </a>
                        <a
                          href="/browse-topics"
                          className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center"
                        >
                          <FiSearch className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="text-sm font-medium text-gray-700">Browse Topics</span>
                        </a>
                        <a
                          href="/propose-topic"
                          className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center"
                        >
                          <FiPlus className="h-5 w-5 text-purple-600 mr-3" />
                          <span className="text-sm font-medium text-gray-700">Propose Topic</span>
                        </a>
                      </>
                    )}
                    {!hasActiveDissertation &&
                      <a
                        href="/my-proposals"
                        className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center"
                      >
                        <FiFileText className="h-5 w-5 text-indigo-600 mr-3" />
                        <span className="text-sm font-medium text-gray-700">My Proposals</span>
                      </a>
                    }
                    <a
                      href="/my-dissertation"
                      className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center"
                    >
                      <FiFileText className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">My Dissertation</span>
                    </a>

                  </>

                )}

                {user?.role === 'teacher' && (
                  <>
                    <a
                      href="/create-topic"
                      className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center"
                    >
                      <FiPlus className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Create Topic</span>
                    </a>
                    <a
                      href="/pending-proposals"
                      className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition flex items-center"
                    >
                      <FiClock className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Pending Proposals</span>
                    </a>
                    <a
                      href="/my-students"
                      className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center"
                    >
                      <FiUsers className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">My Students</span>
                    </a>
                    <a
                      href="/my-topics"
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center"
                    >
                      <FiBookOpen className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">My Topics</span>
                    </a>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <a
                      href="/users"
                      className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center"
                    >
                      <FiUsersIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Manage Users</span>
                    </a>
                    <a
                      href="/settings"
                      className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center"
                    >
                      <FiSettings className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">System Settings</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Welcome!</h3>
              <p className="text-sm text-blue-100">
                You're logged in as a <span className="font-bold">{user?.role}</span>.
                Navigate through the system using the menu above.
              </p>
            </div>

          </div>
        </div>
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;