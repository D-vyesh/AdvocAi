import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { ArrowLeft, Sparkles } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post('/api/auth/reset-password/', {
        email,
        otp_code: otpCode,
        new_password: newPassword,
        new_password2: confirmNewPassword,
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('Reset password failed:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Button
        type="button"
        variant="glass"
        size="sm"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 px-4 py-2 text-xs text-slate-100 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>Return</span>
      </Button>

      <div className="w-full max-w-md glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy relative z-10 space-y-6 animate-fade-in">
        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Verification Code
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            Set New Password
          </h1>
          <p className="text-xs text-slate-300/80">
            Enter the OTP sent to your inbox and establish your new credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-200 pl-1">
              Account Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-10 px-4 text-xs rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otpCode" className="text-xs font-semibold text-slate-200 pl-1">
              Verification OTP
            </Label>
            <Input
              id="otpCode"
              name="otpCode"
              type="text"
              placeholder="000000"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
              className="h-11 px-4 rounded-full font-mono text-center tracking-widest text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-200 pl-1">
              New Password
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="New password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="h-10 px-4 text-xs rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmNewPassword" className="text-xs font-semibold text-slate-200 pl-1">
              Confirm New Password
            </Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={loading}
              className="h-10 px-4 text-xs rounded-full"
            />
          </div>

          <Button
            type="submit"
            variant="aurora"
            className="w-full h-12 text-xs uppercase tracking-wider mt-2"
            disabled={loading}
          >
            {loading ? 'Updating Credentials...' : 'Set New Password'}
          </Button>
        </form>

        <div className="relative z-10 text-center text-xs text-slate-300/80 pt-2 border-t border-white/15">
          Remember credentials?{" "}
          <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
