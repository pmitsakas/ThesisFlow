import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { tw } from '../theme';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccessMsg('OTP sent! Check your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email: formData.email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccessMsg('New OTP sent!');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="h-14 w-14 text-[#1a237e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a237e]">ThesisFlow</h1>
          <p className="mt-1 text-sm text-gray-500">Student Registration</p>
        </div>

        <div className="flex items-center justify-center mb-6 space-x-3">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all
                ${step > s ? 'bg-[#f26522] text-white' : step === s ? 'bg-[#1a237e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-10 ${step > s ? 'bg-[#f26522]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-[#1a237e] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">
              {step === 1 && 'Create your account'}
              {step === 2 && 'Verify your email'}
              {step === 3 && 'Registration complete'}
            </h2>
            <p className="text-blue-200 text-xs mt-0.5">
              {step === 1 && 'Only @york.citycollege.eu emails are accepted'}
              {step === 2 && `We sent a 6-digit code to ${formData.email}`}
              {step === 3 && 'Your account is ready'}
            </p>
            <div className="w-8 h-0.5 bg-[#f26522] mt-2 rounded-full" />
          </div>

          <div className="px-6 py-6">
            {error && <div className={`${tw.alertError} mb-4`}>{error}</div>}
            {successMsg && <div className={`${tw.alertSuccess} mb-4`}>{successMsg}</div>}

            {step === 1 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={tw.input} placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" name="surname" value={formData.surname} onChange={handleChange} required className={tw.input} placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={tw.input} placeholder="student@york.citycollege.eu" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className={tw.input} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={tw.input} placeholder="Repeat your password" />
                </div>
                <button type="submit" disabled={loading} className={`${tw.btnPrimaryFull} py-2.5 text-sm mt-2 disabled:opacity-50`}>
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">6-digit OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setError(''); }}
                    maxLength={6}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1a237e]"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">Code expires in 10 minutes</p>
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className={`${tw.btnPrimaryFull} py-2.5 text-sm disabled:opacity-50`}>
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <button type="button" onClick={handleResend} disabled={loading} className="w-full text-sm text-[#1565c0] hover:text-[#f26522] transition py-1">
                  Resend code
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#1a237e] mb-2">You are all set!</h3>
                <p className="text-gray-500 text-sm mb-6">Your account has been created. You can now log in.</p>
                <button onClick={() => navigate('/login')} className={`${tw.btnPrimaryFull} py-2.5 text-sm`}>
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1565c0] hover:text-[#f26522] font-medium transition">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;