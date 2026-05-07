import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotStep, setForgotStep] = useState(0);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        login(user, accessToken);
        const target = user.role === 'student' && !user.hasCompletedOnboarding
          ? '/onboarding'
          : '/dashboard';
        navigate(target);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setForgotStep(1);
    setFpEmail('');
    setFpOtp('');
    setFpNewPassword('');
    setFpConfirm('');
    setFpError('');
    setFpSuccess('');
  };

  const closeForgot = () => {
    setForgotStep(0);
    setFpError('');
    setFpSuccess('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      await authAPI.forgotPassword({ email: fpEmail });
      setFpSuccess(`OTP sent to ${fpEmail}`);
      setForgotStep(2);
    } catch (err) {
      setFpError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setFpLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      await authAPI.resetPassword({ email: fpEmail, otp: fpOtp, newPassword: '__verify_only__' });
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'INVALID' || code === 'NO_OTP' || code === 'EXPIRED') {
        setFpError(err.response?.data?.error?.message || 'Invalid OTP');
        setFpLoading(false);
        return;
      }
    }
    setForgotStep(3);
    setFpLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFpError('');
    if (fpNewPassword !== fpConfirm) {
      setFpError('Passwords do not match');
      return;
    }
    setFpLoading(true);
    try {
      await authAPI.resetPassword({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword });
      setFpSuccess('Password reset successfully!');
      setForgotStep(4);
    } catch (err) {
      setFpError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <svg className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {forgotStep === 0 ? 'Sign in to your account' : 'Reset your password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dissertation Administration System
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">

          {forgotStep === 0 && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 1 && (
            <form className="space-y-5" onSubmit={handleForgotSubmit}>
              <p className="text-sm text-gray-600">Enter your account email and we'll send you a verification code.</p>
              {fpError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{fpError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={fpEmail}
                  onChange={e => { setFpEmail(e.target.value); setFpError(''); }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={fpLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition"
              >
                {fpLoading ? 'Sending...' : 'Send OTP'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-gray-700 transition">
                ← Back to login
              </button>
            </form>
          )}

          {forgotStep === 2 && (
            <form className="space-y-5" onSubmit={handleOtpSubmit}>
              {fpSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">{fpSuccess}</div>}
              {fpError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{fpError}</div>}
              <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{fpEmail}</strong>.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={fpOtp}
                  onChange={e => { setFpOtp(e.target.value); setFpError(''); }}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-400 mt-1 text-center">Code expires in 10 minutes</p>
              </div>
              <button
                type="submit"
                disabled={fpLoading || fpOtp.length !== 6}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition"
              >
                {fpLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-gray-700 transition">
                ← Back to login
              </button>
            </form>
          )}

          {forgotStep === 3 && (
            <form className="space-y-5" onSubmit={handleResetSubmit}>
              {fpError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{fpError}</div>}
              <p className="text-sm text-gray-600">Choose a new password for your account.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={fpNewPassword}
                  onChange={e => { setFpNewPassword(e.target.value); setFpError(''); }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={fpConfirm}
                  onChange={e => { setFpConfirm(e.target.value); setFpError(''); }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                type="submit"
                disabled={fpLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition"
              >
                {fpLoading ? 'Saving...' : 'Reset Password'}
              </button>
              <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-gray-700 transition">
                ← Back to login
              </button>
            </form>
          )}

          {forgotStep === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Password reset!</h3>
              <p className="text-sm text-gray-500">You can now sign in with your new password.</p>
              <button
                onClick={closeForgot}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
              >
                Back to Login
              </button>
            </div>
          )}

          {forgotStep === 0 && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Test Credentials</span>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <p className="text-xs text-gray-600 mb-2 font-semibold">Admin Account:</p>
                  <p className="text-xs text-gray-600">Email: admin@example.com</p>
                  <p className="text-xs text-gray-600">Password: Admin123!</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;