import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Clock,
  DollarSign,
  ArrowLeft,
  Scale,
  Sparkles,
  X,
  Send,
  Video,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const ProfileDisplayField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3.5 p-3.5 glass-subtle rounded-2xl border border-white/15">
    <div className="glass-circle w-10 h-10 flex-shrink-0 text-cyan-300">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  </div>
);

const LawyerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [contactValue, setContactValue] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdMeetLink, setCreatedMeetLink] = useState("");
  const [copiedMeet, setCopiedMeet] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`api/auth/lawyers/${id}/`);
        setProfileData(response.data);
      } catch (err) {
        console.error("Failed to load lawyer profile:", err);
        toast.error(err.response?.data?.error || "Unable to load lawyer profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const openModal = () => {
    setContactMethod("email");
    setContactValue(user?.email || "");
    setNote("");
    setPreferredTime("");
    setCreatedMeetLink("");
    setIsConnectOpen(true);
  };

  const handleSubmitConnect = async (e) => {
    e.preventDefault();
    if (!profileData?.user?.id) return;

    let preferredTimeIso = null;
    if (preferredTime.trim()) {
      const parsedDate = new Date(preferredTime);
      if (Number.isNaN(parsedDate.getTime())) {
        toast.error("Please select a valid consultation date and time.");
        return;
      }
      preferredTimeIso = parsedDate.toISOString();
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`api/auth/lawyers/${profileData.user.id}/connect/`, {
        message: note.trim(),
        preferred_contact_method: contactMethod,
        preferred_contact_value: contactValue.trim() || user?.email || "",
        preferred_time: preferredTimeIso,
      });
      const meetingLink = response.data?.meeting_link || response.data?.request?.meeting_link;
      if (meetingLink) {
        setCreatedMeetLink(meetingLink);
      }
      toast.success(response.data?.message || "Connection request submitted!");
      if (!meetingLink) {
        setIsConnectOpen(false);
      }
    } catch (err) {
      console.error("Failed to connect with lawyer:", err);
      toast.error(err.response?.data?.error || "Unable to send connection request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "L";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-xs text-slate-300">
          Loading lawyer profile...
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-[2rem] text-sm text-rose-400">
          Lawyer profile not found.
        </div>
      </div>
    );
  }

  const { user: lawyerUser } = profileData;
  const experienceYears = profileData.experience_years ?? 0;
  const isSelf = String(user?.id) === String(lawyerUser?.id);

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button
        type="button"
        variant="glass"
        size="sm"
        onClick={() => navigate(-1)}
        className="h-9 px-4 text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Directory</span>
      </Button>

      <div className="glass-panel glass-reactive p-8 sm:p-10 rounded-[2.5rem] border border-white/30 shadow-fluffy space-y-8">
        {/* Header */}
        <div className="relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill">
            <Scale className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Lawyer Profile · {profileData.verification_status?.toUpperCase()}
            </span>
          </div>

          <div className="glass-circle w-24 h-24 mx-auto text-2xl font-black text-cyan-200 shadow-glass-glow">
            {lawyerUser?.profile_picture ? (
              <img
                src={lawyerUser.profile_picture}
                alt={lawyerUser?.name || "Lawyer"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(lawyerUser?.name || lawyerUser?.username || "")
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              {lawyerUser?.name || lawyerUser?.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1">
              {profileData.education || profileData.specializations?.join(", ") || "Legal Professional"}
            </p>
          </div>

          {!isSelf && (
            <div className="pt-2">
              <Button onClick={openModal} variant="aurora" size="lg" className="h-11 px-7 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Connect with {lawyerUser?.name || "Lawyer"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="relative z-10 space-y-3">
          <h2 className="text-base font-bold text-white font-display">Contact & Identity</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <ProfileDisplayField icon={<User className="w-4 h-4" />} label="Full Name" value={lawyerUser?.name || "Not provided"} />
            <ProfileDisplayField icon={<User className="w-4 h-4" />} label="Handle" value={`@${lawyerUser?.username || "lawyer"}`} />
            <ProfileDisplayField icon={<Mail className="w-4 h-4" />} label="Email" value={lawyerUser?.email || "Not available"} />
            <ProfileDisplayField icon={<Phone className="w-4 h-4" />} label="Phone" value={profileData.phone || lawyerUser?.phone || "Not provided"} />
          </div>
        </div>

        {/* Professional Details */}
        <div className="relative z-10 space-y-3">
          <h2 className="text-base font-bold text-white font-display">Practice Credentials</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <ProfileDisplayField icon={<GraduationCap className="w-4 h-4" />} label="Education" value={profileData.education || "Not provided"} />
            <ProfileDisplayField icon={<Building className="w-4 h-4" />} label="Law Firm" value={profileData.law_firm || "Independent"} />
            <ProfileDisplayField
              icon={<Clock className="w-4 h-4" />}
              label="Experience"
              value={`${experienceYears} ${experienceYears === 1 ? "year" : "years"}`}
            />
            <ProfileDisplayField icon={<DollarSign className="w-4 h-4" />} label="Consultation Fee" value={profileData.consultation_fee || "Contact for details"} />
          </div>

          {profileData.bio && (
            <div className="glass-subtle p-4 rounded-2xl border border-white/15 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400">About</p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {profileData.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {isConnectOpen && (
        <div
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsConnectOpen(false)}
        >
          <div
            className="w-full max-w-md glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/30 shadow-fluffy space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <h3 className="text-base font-extrabold text-white font-display">Request Consultation</h3>
              <Button
                type="button"
                variant="glass-circle"
                size="icon-sm"
                onClick={() => setIsConnectOpen(false)}
                className="w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {createdMeetLink ? (
              <div className="relative z-10 space-y-4 py-2">
                <div className="glass-subtle p-4 rounded-2xl border border-emerald-300/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Video className="w-4 h-4" />
                    <span>Google Meet Link Generated</span>
                  </div>
                  <p className="text-xs font-mono text-white break-all">{createdMeetLink}</p>
                </div>
                <div className="flex gap-2.5">
                  <Button
                    variant="glass"
                    onClick={() => {
                      navigator.clipboard.writeText(createdMeetLink);
                      setCopiedMeet(true);
                      toast.success("Meeting link copied!");
                    }}
                    className="flex-1 h-10 text-xs"
                  >
                    {copiedMeet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                    <span>{copiedMeet ? "Copied" : "Copy Link"}</span>
                  </Button>
                  <Button variant="aurora" onClick={() => setIsConnectOpen(false)} className="flex-1 h-10 text-xs">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitConnect} className="relative z-10 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">Note for Counsel (optional)</Label>
                  <textarea
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share context about your legal request..."
                    className="glass-input w-full p-3.5 rounded-2xl text-xs text-white resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">Preferred Contact</Label>
                  <Input
                    type="text"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="you@example.com or phone"
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">Preferred Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>
                <Button type="submit" variant="aurora" disabled={submitting} className="w-full h-11 text-xs">
                  <Send className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{submitting ? "Sending..." : "Submit Request"}</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerProfile;
