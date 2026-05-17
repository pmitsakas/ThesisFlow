import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { tw } from '../theme';

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
        const target = user.role === 'student' && !user.hasCompletedOnboarding ? '/onboarding' : '/dashboard';
        navigate(target);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => { setForgotStep(1); setFpEmail(''); setFpOtp(''); setFpNewPassword(''); setFpConfirm(''); setFpError(''); setFpSuccess(''); };
  const closeForgot = () => { setForgotStep(0); setFpError(''); setFpSuccess(''); };

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
    if (fpNewPassword !== fpConfirm) { setFpError('Passwords do not match'); return; }
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
    <div className="min-h-screen bg-[#f5f5f5] flex items-start justify-center py-12 px-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a237e]">ThesisFlow</h1>
          <p className="mt-1 text-sm text-gray-500">Dissertation Administration System</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-[#1a237e] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">
              {forgotStep === 0 && 'Sign in to your account'}
              {forgotStep === 1 && 'Reset your password'}
              {forgotStep === 2 && 'Enter verification code'}
              {forgotStep === 3 && 'Choose a new password'}
              {forgotStep === 4 && 'Password reset complete'}
            </h2>
            <div className="w-8 h-0.5 bg-[#f26522] mt-1 rounded-full" />
          </div>

          <div className="px-6 py-6">

            {forgotStep === 0 && (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <div className={tw.alertError}>{error}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={tw.input}
                    placeholder="you@york.citycollege.eu"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={openForgot} className="text-xs text-[#1565c0] hover:text-[#f26522] transition">
                      Forgot your password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={tw.input}
                    placeholder="••••••••"
                  />
                </div>

                <button type="submit" disabled={loading} className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">Test Credentials</span></div>
                </div>
                <div className="bg-[#f5f5f5] p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Admin Account:</p>
                  <p className="text-xs text-gray-500">Email: admin@example.com</p>
                  <p className="text-xs text-gray-500">Password: Admin123!</p>
                </div>
              </form>
            )}

            {forgotStep === 1 && (
              <form className="space-y-5" onSubmit={handleForgotSubmit}>
                <p className="text-sm text-gray-600">Enter your account email and we will send you a verification code.</p>
                {fpError && <div className={tw.alertError}>{fpError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input type="email" required value={fpEmail} onChange={e => { setFpEmail(e.target.value); setFpError(''); }} className={tw.input} placeholder="you@york.citycollege.eu" />
                </div>
                <button type="submit" disabled={fpLoading} className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50`}>
                  {fpLoading ? 'Sending...' : 'Send OTP'}
                </button>
                <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-[#1a237e] transition">
                  - Back to login
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form className="space-y-5" onSubmit={handleOtpSubmit}>
                {fpSuccess && <div className={tw.alertSuccess}>{fpSuccess}</div>}
                {fpError && <div className={tw.alertError}>{fpError}</div>}
                <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{fpEmail}</strong>.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <input type="text" maxLength={6} required value={fpOtp} onChange={e => { setFpOtp(e.target.value); setFpError(''); }} className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1a237e]" placeholder="000000" />
                  <p className="text-xs text-gray-400 mt-1 text-center">Code expires in 10 minutes</p>
                </div>
                <button type="submit" disabled={fpLoading || fpOtp.length !== 6} className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50`}>
                  {fpLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-[#1a237e] transition">
                  - Back to login
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form className="space-y-5" onSubmit={handleResetSubmit}>
                {fpError && <div className={tw.alertError}>{fpError}</div>}
                <p className="text-sm text-gray-600">Choose a new password for your account.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" required value={fpNewPassword} onChange={e => { setFpNewPassword(e.target.value); setFpError(''); }} className={tw.input} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" required value={fpConfirm} onChange={e => { setFpConfirm(e.target.value); setFpError(''); }} className={tw.input} placeholder="Repeat new password" />
                </div>
                <button type="submit" disabled={fpLoading} className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50`}>
                  {fpLoading ? 'Saving...' : 'Reset Password'}
                </button>
                <button type="button" onClick={closeForgot} className="w-full text-sm text-gray-500 hover:text-[#1a237e] transition">
                  - Back to login
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
                <h3 className="text-lg font-semibold text-[#1a237e]">Password reset!</h3>
                <p className="text-sm text-gray-500">You can now sign in with your new password.</p>
                <button onClick={closeForgot} className={`${tw.btnPrimaryFull} py-2.5 text-sm`}>
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-[#1565c0] hover:text-[#f26522] transition">
            {"Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;