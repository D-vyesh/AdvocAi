import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { ArrowLeft, Sparkles, User, Mail, Lock, Phone } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: ''
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

    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'client',
      };

      const response = await axios.post('api/auth/signup/', payload);
      toast.success(response.data.message);
      if (response.data.requires_verification) {
        navigate('/verify-otp', { state: { email: response.data.email } });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
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

      {/* Floating Fluffy Glass Signup Card */}
      <div className="w-full max-w-lg glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy relative z-10 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Join AdvocAI
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-300/80">
            Start automating contract review and smart document generation
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-300" /> Full Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="h-10 px-4 text-xs rounded-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-slate-200 pl-1">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="janedoe"
                required
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className="h-10 px-4 text-xs rounded-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-300" /> Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@organization.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className="h-10 px-4 text-xs rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-300" /> Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="h-10 px-4 text-xs rounded-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password2" className="text-xs font-semibold text-slate-200 pl-1">
                Confirm
              </Label>
              <Input
                id="password2"
                name="password2"
                type="password"
                required
                value={formData.password2}
                onChange={handleInputChange}
                disabled={loading}
                className="h-10 px-4 text-xs rounded-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-300" /> Phone (Optional)
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1-555-0199"
              value={formData.phone}
              onChange={handleInputChange}
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
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
          </Button>
        </form>

        <div className="relative z-10 text-center text-xs text-slate-300/80 pt-2 border-t border-white/15">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
