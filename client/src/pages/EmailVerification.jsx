import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import api from '../api';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Initialize status based on user's current verification state
  const isAlreadyVerified = user && user.email_verified;
  const [status, setStatus] = useState(() => isAlreadyVerified ? 'success' : 'verifying'); // 'verifying', 'success', 'error', 'expired'
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'

  const verifyEmail = useCallback(async () => {
    try {
      setStatus('verifying');
      await api.post('/auth/verify-email', { token });
      setStatus('success');
    } catch (err) {
      console.error('Verification error:', err);
      if (err.response?.status === 400) {
        setStatus('expired');
      } else {
        setStatus('error');
        setError(err.response?.data?.error || 'Verification failed');
      }
    }
  }, [token]);

  useEffect(() => {
    // Skip verification if already verified or no token
    if (isAlreadyVerified || !token) {
      return;
    }
    verifyEmail();
  }, [token, isAlreadyVerified, verifyEmail]);

  const handleResendVerification = async () => {
    if (!user) {
      setError('Please log in to resend verification email');
      return;
    }

    try {
      setResendStatus('sending');
      await api.post('/auth/resend-verification', {
        email: user.email
      });
      setResendStatus('success');
    } catch (err) {
      console.error('Resend error:', err);
      setResendStatus('error');
      setError(err.response?.data?.error || 'Failed to resend verification email');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Email Verified Successfully!</h2>
            <p className="text-gray-600 mt-2">Your email address has been verified. You can now enjoy all features of ShopFlow.</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Continue to ShopFlow
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-white text-emerald-500 py-3 px-4 rounded-lg border-2 border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                Update Your Profile
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Verification Link Expired</h2>
            <p className="text-gray-600 mt-2">This verification link has expired. Don't worry, we can send you a new one.</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendStatus === 'sending'}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {resendStatus === 'success' && (
                <p className="text-green-600">Verification email sent! Please check your inbox.</p>
              )}
              {resendStatus === 'error' && (
                <p className="text-red-600">{error}</p>
              )}
              <Link
                to="/login"
                className="block w-full bg-white text-emerald-500 py-3 px-4 rounded-lg border-2 border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Verification Failed</h2>
            <p className="text-gray-600 mt-2">{error || 'There was an error verifying your email address.'}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={verifyEmail}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleResendVerification}
                disabled={resendStatus === 'sending'}
                className="w-full bg-white text-emerald-500 py-3 px-4 rounded-lg border-2 border-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <Link
                to="/login"
                className="block w-full bg-white text-emerald-500 py-3 px-4 rounded-lg border-2 border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
            <p className="text-gray-600 mt-2">Verify your email address to complete registration</p>
          </div>

          {getStatusContent()}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Having trouble? Contact our support team for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;