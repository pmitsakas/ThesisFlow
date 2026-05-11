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
              <svg className="h-8 w-8 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
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
                <Link
                  to="/login"
                  className={`${tw.btnPrimary} px-4 py-2 text-sm`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${tw.btnAccent} px-4 py-2 text-sm`}
                >
                  Register
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