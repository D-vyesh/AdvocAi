import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;
      const response = await axios.post('api/auth/google/', { token });
      await login(null, null, response.data.user, response.data.tokens);
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.error || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Fluffy Back Pill Button */}
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

      {/* Floating Fluffy Glass Login Card */}
      <div className="w-full max-w-md glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy relative z-10 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              AdvocAI Access
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-300/80">
            Sign in to access your contracts and legal workspaces
          </p>
        </div>

        {/* Google OAuth Login */}
        <div className="relative z-10 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="pill"
            theme="filled_black"
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex-1 h-px bg-white/20" />
          <span className="glass-pill px-3.5 py-0.5 text-[11px] uppercase tracking-wider text-slate-200">
            or continue with email
          </span>
          <span className="flex-1 h-px bg-white/20" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-300" /> Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="attorney@firm.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className="h-11 px-4 text-xs sm:text-sm rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-300" /> Password
              </Label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-cyan-300 hover:underline">
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              value={formData.password}
              onChange={handleInputChange}
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
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </Button>
        </form>

        <div className="relative z-10 text-center text-xs text-slate-300/80 pt-2 border-t border-white/15">
          Don't have an account yet?{" "}
          <Link to="/signup" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
