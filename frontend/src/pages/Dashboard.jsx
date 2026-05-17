import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tw } from '../theme';
import { FiPlus, FiUsers, FiClock, FiUser, FiFileText, FiSettings } from 'react-icons/fi';
import { FiUsers as FiUsersIcon } from 'react-icons/fi';
import ProposalModal from '../components/ProposalModal';

const Dashboard = () => {
  const { user, hasActiveDissertation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const getRoleBadgeColor = (role) => ({
    admin:   'bg-[#f26522]/10 text-[#f26522]',
    teacher: 'bg-[#1a237e]/10 text-[#1a237e]',
    student: 'bg-green-100 text-green-800',
  }[role] || 'bg-gray-100 text-gray-800');

  const getStatusBadgeColor = (isActive) =>
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const actionLink = (href, icon, label) => (
    <a
      href={href}
      className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 border border-gray-200 hover:border-[#f26522] hover:bg-[#f26522]/5 group"
    >
      <span className="text-[#1a237e] group-hover:text-[#f26522] transition">{icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a237e]">{label}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a237e]">Dashboard</h1>
          <div className="w-10 h-1 bg-[#f26522] mt-2 rounded-full" />
          <p className="mt-2 text-gray-500">Welcome back to your workspace</p>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#1a237e] text-white p-4 rounded-full shadow-lg hover:bg-[#0d1b6e] transition"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`${tw.card} overflow-hidden`}>
              <div className="bg-[#1a237e] px-6 py-8">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#1a237e]">
                      {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user?.name} {user?.surname}</h2>
                    <p className="text-blue-200 mt-1 text-sm">{user?.email}</p>
                    <div className="w-8 h-0.5 bg-[#f26522] mt-2 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-[#1a237e] mb-4">Account Information</h3>
                <div className="space-y-0">
                  {[
                    { label: 'Full Name', value: `${user?.name} ${user?.surname}` },
                    { label: 'Email', value: user?.email },
                    {
                      label: 'Role', value: (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role)}`}>
                          {user?.role?.toUpperCase()}
                        </span>
                      )
                    },
                    {
                      label: 'Account Status', value: (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user?.is_active)}`}>
                          {user?.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )
                    },
                    {
                      label: 'Member Since', value: user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'
                    },
                  ].map((row, i, arr) => (
                    <div key={row.label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-sm font-medium text-gray-500">{row.label}</span>
                      <span className="text-sm text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`
            space-y-4
            fixed lg:static inset-y-0 right-0 z-40
            w-80 lg:w-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 h-full lg:h-auto overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-[#1a237e]">Quick Actions</h3>
                  <div className="w-6 h-0.5 bg-[#f26522] mt-1 rounded-full" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {user?.role === 'student' && (<>
                  {actionLink('/student/profile', <FiUser className="h-5 w-5" />, 'My Profile')}
                  {hasActiveDissertation
                    ? actionLink('/my-dissertation', <FiFileText className="h-5 w-5" />, 'My Dissertation')
                    : actionLink('/my-proposals', <FiFileText className="h-5 w-5" />, 'My Proposals')
                  }
                  {!hasActiveDissertation && (
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 border border-gray-200 hover:border-[#f26522] hover:bg-[#f26522]/5 group cursor-pointer"
                    >
                      <span className="text-[#1a237e] group-hover:text-[#f26522] transition"><FiPlus className="h-5 w-5" /></span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a237e]">New Proposal</span>
                    </button>
                  )}
                </>)}
                {user?.role === 'teacher' && (<>
                  {actionLink('/pending-proposals', <FiClock className="h-5 w-5" />, 'Pending Proposals')}
                  {actionLink('/my-students', <FiUsers className="h-5 w-5" />, 'My Students')}
                </>)}
                {user?.role === 'admin' && (<>
                  {actionLink('/users', <FiUsersIcon className="h-5 w-5" />, 'Manage Users')}
                  {actionLink('/settings', <FiSettings className="h-5 w-5" />, 'System Settings')}
                </>)}
              </div>
            </div>

            <div className="bg-[#1a237e] rounded-xl p-6 text-white">
              <h3 className="text-base font-semibold mb-1">Welcome!</h3>
              <div className="w-6 h-0.5 bg-[#f26522] mb-3 rounded-full" />
              <p className="text-sm text-blue-200">
                You are logged in as a <span className="font-bold text-white">{user?.role}</span>. Navigate through the system using the menu above.
              </p>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" />
        )}
      </div>

      {showProposalModal && (
        <ProposalModal
          onClose={() => setShowProposalModal(false)}
          onSubmitted={() => setShowProposalModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;