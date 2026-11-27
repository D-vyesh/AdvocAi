import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import {
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Lock,
  Phone,
  Scale,
  BadgeCheck,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    license_number: '',
    bar_council_id: '',
    education: '',
    experience_years: '',
    law_firm: '',
    specializations: '',
    consultation_fee: '',
    bio: '',
    verification_documents: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const extractErrorMessage = (error) => {
    const data = error?.response?.data;
    if (!data) return 'Signup failed. Please check your details.';
    if (typeof data.error === 'string') return data.error;
    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      const firstVal = data[firstKey];
      if (Array.isArray(firstVal) && firstVal.length > 0) return firstVal[0];
      if (typeof firstVal === 'string') return firstVal;
    }
    return 'Signup failed.';
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
        password2: formData.password2,
        phone: formData.phone,
        role: accountType,
      };

      if (accountType === 'lawyer') {
        payload.license_number = formData.license_number;
        payload.bar_council_id = formData.bar_council_id;
        payload.education = formData.education;
        payload.experience_years = formData.experience_years ? Number(formData.experience_years) : 0;
        payload.law_firm = formData.law_firm;
        payload.consultation_fee = formData.consultation_fee;
        payload.bio = formData.bio;
        payload.specializations = formData.specializations
          ? formData.specializations.split(',').map(item => item.trim()).filter(Boolean)
          : [];
        payload.verification_documents = formData.verification_documents
          ? formData.verification_documents.split(',').map(item => item.trim()).filter(Boolean)
          : [];
      }

      const response = await axios.post('api/auth/signup/', payload);
      toast.success(response.data.message);
      if (response.data.lawyer_message) {
        toast(response.data.lawyer_message, { icon: '⚖️', duration: 5000 });
      }
      if (response.data.requires_verification) {
        navigate('/verify-otp', { state: { email: response.data.email } });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(extractErrorMessage(error));
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
      <div className={`w-full ${accountType === 'lawyer' ? 'max-w-2xl' : 'max-w-lg'} glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy relative z-10 space-y-6 animate-fade-in transition-all duration-300`}>

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
            Choose your role to access tailored AI legal workflows and lawyer collaboration
          </p>
        </div>

        {/* Role Selector Segmented Glass Pill */}
        <div className="relative z-10 grid grid-cols-2 gap-3 p-1.5 rounded-full bg-white/[0.06] border border-white/20">
          <Button
            type="button"
            variant={accountType === 'client' ? 'aurora' : 'ghost'}
            onClick={() => setAccountType('client')}
            disabled={loading}
            className="w-full h-10 text-xs"
          >
            <User className="w-3.5 h-3.5 text-cyan-300" />
            <span>I&apos;m a Client</span>
          </Button>
          <Button
            type="button"
            variant={accountType === 'lawyer' ? 'emerald' : 'ghost'}
            onClick={() => setAccountType('lawyer')}
            disabled={loading}
            className="w-full h-10 text-xs"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-300" />
            <span>I&apos;m a Lawyer</span>
          </Button>
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
                placeholder="8+ chars, upper/lower/num/symbol"
                required
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="h-10 px-4 text-xs rounded-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password2" className="text-xs font-semibold text-slate-200 pl-1">
                Confirm Password
              </Label>
              <Input
                id="password2"
                name="password2"
                type="password"
                placeholder="Repeat password"
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

          {/* Lawyer-Only Professional Verification Fields */}
          {accountType === 'lawyer' && (
            <div className="space-y-4 p-5 rounded-3xl glass-subtle border border-emerald-300/35 animate-fade-in">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/15">
                <div className="glass-circle w-8 h-8">
                  <BadgeCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-display">Professional Credentials</h2>
                  <p className="text-[11px] text-slate-300/80">
                    Verified by AdvocAI administrators before appearing in Lawyer Connect
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="license_number" className="text-xs font-semibold text-slate-200 pl-1">
                    Bar License Number *
                  </Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    placeholder="State Bar License #"
                    required={accountType === 'lawyer'}
                    value={formData.license_number}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bar_council_id" className="text-xs font-semibold text-slate-200 pl-1">
                    Bar Council ID *
                  </Label>
                  <Input
                    id="bar_council_id"
                    name="bar_council_id"
                    placeholder="Bar Council Reg. ID"
                    required={accountType === 'lawyer'}
                    value={formData.bar_council_id}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="education" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" /> Education
                  </Label>
                  <Input
                    id="education"
                    name="education"
                    placeholder="e.g. JD, Harvard Law / LL.M"
                    value={formData.education}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="experience_years" className="text-xs font-semibold text-slate-200 pl-1">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="law_firm" className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-300" /> Law Firm / Practice
                  </Label>
                  <Input
                    id="law_firm"
                    name="law_firm"
                    placeholder="Firm name or Independent"
                    value={formData.law_firm}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="consultation_fee" className="text-xs font-semibold text-slate-200 pl-1">
                    Consultation Fee
                  </Label>
                  <Input
                    id="consultation_fee"
                    name="consultation_fee"
                    placeholder="e.g. $150/hr or ₹1500/hr"
                    value={formData.consultation_fee}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specializations" className="text-xs font-semibold text-slate-200 pl-1">
                  Specializations (comma-separated)
                </Label>
                <Input
                  id="specializations"
                  name="specializations"
                  placeholder="Corporate Law, IP, Employment, Real Estate"
                  value={formData.specializations}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="h-10 px-4 text-xs rounded-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-semibold text-slate-200 pl-1">
                  Professional Bio
                </Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  placeholder="Describe your experience, notable cases, or advisory focus."
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="glass-input w-full p-3.5 rounded-2xl text-xs text-white placeholder:text-slate-400/60 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="verification_documents" className="text-xs font-semibold text-slate-200 pl-1">
                  Verification Document URLs (optional, comma-separated)
                </Label>
                <Input
                  id="verification_documents"
                  name="verification_documents"
                  placeholder="https://..."
                  value={formData.verification_documents}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="h-10 px-4 text-xs rounded-full"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant={accountType === 'lawyer' ? 'emerald' : 'aurora'}
            className="w-full h-12 text-xs uppercase tracking-wider mt-2"
            disabled={loading}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>
              {loading
                ? 'Creating Account...'
                : accountType === 'lawyer'
                ? 'Submit Lawyer Application'
                : 'Get Started'}
            </span>
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
