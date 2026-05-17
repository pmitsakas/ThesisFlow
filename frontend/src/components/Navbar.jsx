import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { tw } from '../theme';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md border-b-2 border-[#f26522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
  <img src="/logo_tab.png" alt="ThesisFlow" className="h-8 w-8 object-contain" />
  <span className="text-xl font-bold text-[#1a237e]">ThesisFlow</span>
</Link>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-[#1a237e] hover:text-[#f26522] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                <NotificationBell />
                <span className="text-sm font-medium text-gray-600 border-l border-gray-200 pl-3">
                  {user.name} {user.surname}
                </span>
                <button
                  onClick={logout}
                  className="border border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-[#1a237e] hover:text-[#f26522] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Home
                </Link>

              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;