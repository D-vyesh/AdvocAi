import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('No email provided for OTP verification.');
      navigate('/signup');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('api/auth/verify-otp/', { email, otp_code: otp });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/auth/resend-otp/', { email });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP.');
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
        onClick={() => navigate('/signup')}
        className="absolute top-6 left-6 z-20 px-4 py-2 text-xs text-slate-100 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>Return</span>
      </Button>

      <div className="w-full max-w-md glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy relative z-10 space-y-6 animate-fade-in text-center">

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Email Authentication
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            Verify Your Code
          </h1>
          <p className="text-xs text-slate-300/80">
            A 6-digit confirmation code was dispatched to{" "}
            <span className="font-semibold text-cyan-300">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="relative z-10 space-y-5">
          <div>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="h-14 text-center text-3xl tracking-[0.4em] font-mono rounded-full font-bold text-white"
              required
            />
            <p className="text-[11px] text-slate-400 mt-2">Enter the 6 digits from your email</p>
          </div>

          <Button
            type="submit"
            variant="aurora"
            disabled={loading || otp.length !== 6}
            className="w-full h-12 text-xs uppercase tracking-wider"
          >
            {loading ? 'Validating Code...' : 'Confirm Account'}
          </Button>
        </form>

        <div className="relative z-10 pt-2 border-t border-white/15 text-xs text-slate-300/80 flex items-center justify-center gap-2">
          <span>Didn't receive the code?</span>
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleResendOtp}
            disabled={loading}
            className="h-7 px-3 text-[11px] text-cyan-300"
          >
            Resend Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
