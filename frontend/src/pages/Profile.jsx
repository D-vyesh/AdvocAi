import React, { useState, useEffect } from "react";
import { User, Mail, Camera, Edit2, Check, X, Sparkles, AtSign } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";

const Profile = () => {
  const { user, loading, setUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    profile_picture: '',
    cover_photo: '',
    new_profile_picture: null,
    new_cover_photo: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        profile_picture: user.profile_picture || '',
        cover_photo: user.cover_photo || '',
        new_profile_picture: null,
        new_cover_photo: null,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, new_profile_picture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, new_cover_photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      if (profileData.new_profile_picture) {
        formData.append('profile_picture', profileData.new_profile_picture);
      }
      if (profileData.new_cover_photo) {
        formData.append('cover_photo', profileData.new_cover_photo);
      }

      const response = await axios.patch('api/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile updated successfully!');
      setUser(response.data);
      setIsEditing(false);
      setPreviewImage(null);
      setPreviewCoverImage(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setPreviewCoverImage(null);
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        profile_picture: user.profile_picture || '',
        cover_photo: user.cover_photo || '',
        new_profile_picture: null,
        new_cover_photo: null,
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-center">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-300">Loading profile attributes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-[2rem] text-center max-w-sm">
          <User className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const displayImage = previewImage || profileData.profile_picture;

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Header Badge */}
      <div className="text-center mb-8 space-y-2 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
            Identity & Preferences
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-300/80">
          Manage your verified credentials and appearance
        </p>
      </div>

      {/* Main Fluffy Glass Profile Card */}
      <div className="glass-panel glass-reactive rounded-[2.5rem] border border-white/30 overflow-hidden shadow-fluffy">

        {/* Cover Photo Area with Glossy Glass Sheen */}
        <div className="h-44 sm:h-52 relative overflow-hidden bg-gradient-to-r from-cyan-500/25 via-indigo-500/25 to-purple-500/25">
          {profileData.cover_photo || previewCoverImage ? (
            <img
              src={previewCoverImage || profileData.cover_photo}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="glass-pill px-4 py-1 text-xs font-bold text-white/75 uppercase tracking-widest">
                AdvocAI Workspace
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

          {isEditing && (
            <label
              htmlFor="cover-photo-upload"
              className="absolute bottom-4 right-4 glass-pill px-4 py-1.5 cursor-pointer text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg z-20"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-300" />
              <span>Change Cover</span>
              <input
                id="cover-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileChange}
              />
            </label>
          )}
        </div>

        {/* Content Area */}
        <div className="relative z-10 px-6 sm:px-10 pb-10">

          {/* Avatar Section Overlap */}
          <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="relative inline-block">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full glass-circle p-1.5 border-2 border-white/60 shadow-glass-glow bg-slate-900/75 overflow-hidden">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
                    {getInitials(profileData.name || profileData.username)}
                  </div>
                )}
              </div>

              {isEditing && (
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-1 right-1 glass-circle w-9 h-9 cursor-pointer text-white shadow-xl hover:scale-110"
                  title="Upload Avatar"
                >
                  <Camera className="w-4 h-4 text-cyan-300" />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileFileChange}
                  />
                </label>
              )}
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="glass"
                className="h-10 px-5 text-xs text-white"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-300" /> Full Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="h-11 px-4 text-sm rounded-full"
                  placeholder="Enter full name"
                />
              ) : (
                <div className="glass-subtle p-3.5 px-5 rounded-2xl text-sm font-semibold text-white">
                  {profileData.name || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-amber-300" /> Username
              </label>
              <div className="glass-subtle p-3.5 px-5 rounded-2xl flex items-center justify-between text-sm text-slate-200">
                <span>@{profileData.username || 'username'}</span>
                <span className="text-[11px] text-slate-400 font-medium">Permanent handle</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 pl-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-300" /> Email Address
              </label>
              <div className="glass-subtle p-3.5 px-5 rounded-2xl flex items-center justify-between text-sm text-slate-200">
                <span>{profileData.email || 'Not provided'}</span>
                <span className="glass-pill px-3 py-0.5 text-[10px] text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Edit Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-6 mt-6 border-t border-white/15">
              <Button
                onClick={handleCancel}
                disabled={saving}
                variant="glass"
                className="flex-1 h-11 text-xs text-slate-100"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                variant="aurora"
                className="flex-1 h-11 text-xs"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
