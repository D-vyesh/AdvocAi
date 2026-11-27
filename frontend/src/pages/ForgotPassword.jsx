import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { ArrowLeft, Mail, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/forgot-password/', { email });
      toast.success(response.data.message);
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error(error.response?.data?.error || 'Failed to send OTP.');
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
              Account Recovery
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            Reset Password
          </h1>
          <p className="text-xs text-slate-300/80">
            Enter your email to receive an instant verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-300" /> Account Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 px-4 text-xs sm:text-sm rounded-full"
            />
          </div>

          <Button
            type="submit"
            variant="aurora"
            className="w-full h-12 text-xs uppercase tracking-wider mt-2"
            disabled={loading}
          >
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </Button>
        </form>

        <div className="relative z-10 text-center text-xs text-slate-300/80 pt-2 border-t border-white/15">
          Remember password?{" "}
          <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
