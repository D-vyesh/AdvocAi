import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/Components/ui/button";
import { BadgeCheck, Clock, ShieldAlert, MessageSquare, CheckCircle2, XCircle, Video, Scale } from "lucide-react";

const statusBadgeStyles = {
  pending: "text-amber-200 border-amber-300/45 bg-amber-400/15",
  approved: "text-emerald-200 border-emerald-300/45 bg-emerald-400/15",
  rejected: "text-rose-200 border-rose-300/45 bg-rose-400/15",
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LawyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "lawyer") {
      toast.error("This dashboard is only available to lawyer accounts.");
      navigate("/");
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await axios.get("api/auth/lawyer/dashboard/");
        setDashboard(response.data);
      } catch (err) {
        console.error("Failed to load lawyer dashboard:", err);
        setError(err.response?.data?.error || "Unable to load lawyer dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, navigate]);

  const handleConnectionUpdate = async (requestId, status) => {
    try {
      const response = await axios.patch(`api/auth/lawyer/connections/${requestId}/`, { status });
      toast.success(response.data?.message || "Connection updated.");

      const dashboardResponse = await axios.get("api/auth/lawyer/dashboard/");
      setDashboard(dashboardResponse.data);

      if (status === 'accepted') {
        toast.success('Connection accepted! You can now chat with the client.', { duration: 4000 });
      }
    } catch (err) {
      console.error("Failed to update connection request:", err);
      toast.error(err.response?.data?.error || "Unable to update request.");
    }
  };

  const handleOpenChat = async (connection) => {
    try {
      const convResponse = await axios.get(
        `api/auth/chat/conversations/?connection_request_id=${connection.id}`
      );
      if (convResponse.data && convResponse.data.id) {
        navigate(`/chat/${convResponse.data.id}`);
        return;
      }

      const allConvsResponse = await axios.get('api/auth/chat/conversations/');
      const conv = allConvsResponse.data.find(c =>
        c.connection_request_id === connection.id ||
        (c.client?.id === connection.client?.id && c.lawyer?.id === connection.lawyer?.id)
      );

      if (conv) {
        navigate(`/chat/${conv.id}`);
      } else {
        toast.error('Chat conversation not found. Please refresh and try again.');
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to open chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-xs text-slate-300">
          Loading lawyer dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-[2rem] text-sm text-rose-400">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { profile, connections, summary, user: lawyerUser } = dashboard;
  const verificationStatus = lawyerUser?.lawyer_verification_status || profile?.verification_status || "pending";

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Verification Status Header */}
      <div className="glass-panel glass-reactive p-7 sm:p-8 rounded-[2.5rem] border border-white/25 shadow-fluffy">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="glass-circle w-14 h-14 shadow-glass-glow flex-shrink-0">
              <BadgeCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">Lawyer Hub</h1>
              <p className="text-xs sm:text-sm text-slate-300/80">
                Verification status & client consultation queue
              </p>
            </div>
          </div>

          <span className={`glass-pill px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider border ${statusBadgeStyles[verificationStatus] || "text-slate-200"}`}>
            Status: {verificationStatus}
          </span>
        </div>

        {(profile?.verification_notes || verificationStatus !== "approved") && (
          <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            {verificationStatus === "pending" && (
              <div className="flex items-center gap-2 text-amber-200 text-xs font-medium">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Your credentials are under admin review. Approved profiles appear in Lawyer Connect.</span>
              </div>
            )}
            {verificationStatus === "rejected" && (
              <div className="flex items-center gap-2 text-rose-200 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 text-rose-300" />
                <span>Verification was declined. Update your credentials or contact support.</span>
              </div>
            )}
            {profile?.verification_notes && (
              <p className="text-xs text-slate-300">Notes: {profile.verification_notes}</p>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: summary.total_requests, color: "text-white" },
          { label: "Pending", value: summary.pending_requests, color: "text-amber-300" },
          { label: "Accepted", value: summary.accepted_requests, color: "text-emerald-300" },
          { label: "Declined", value: summary.declined_requests, color: "text-rose-300" },
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel glass-reactive p-5 rounded-3xl border border-white/20">
            <div className="relative z-10">
              <p className="text-xs text-slate-300/80 font-medium">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 font-display ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Client Connection Requests */}
      <div className="glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/25 shadow-fluffy space-y-5">
        <div className="relative z-10 flex items-center gap-3 pb-4 border-b border-white/15">
          <div className="glass-circle w-10 h-10">
            <Scale className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Client Connection Requests</h2>
            <p className="text-xs text-slate-300/80">Accept consultations to open real-time messaging & document sharing</p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {connections.length === 0 ? (
            <div className="glass-subtle rounded-2xl p-10 text-center text-xs text-slate-300">
              No connection requests yet.
            </div>
          ) : (
            connections.map((connection) => (
              <div
                key={connection.id}
                className="glass-subtle rounded-3xl p-5 border border-white/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-base font-bold text-white font-display">
                      {connection.client?.name || connection.client?.username || "Client"}
                    </p>
                    <span className={`glass-pill px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadgeStyles[connection.status] || "text-slate-200"}`}>
                      {connection.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300/85">
                    Contact: {connection.preferred_contact_value || connection.client?.email || "Not provided"}
                  </p>

                  {connection.preferred_time && (
                    <p className="text-xs text-slate-300/80">
                      Preferred time: {formatDateTime(connection.preferred_time)}
                    </p>
                  )}

                  {connection.meeting_link && (
                    <p className="text-xs text-cyan-300 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <a
                        href={connection.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-cyan-200 truncate max-w-sm"
                      >
                        {connection.meeting_link}
                      </a>
                    </p>
                  )}

                  {connection.message && (
                    <p className="text-xs text-slate-100 mt-2 glass-panel p-3 rounded-2xl border border-white/15 whitespace-pre-wrap">
                      “{connection.message}”
                    </p>
                  )}
                </div>

                {connection.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="emerald"
                      onClick={() => handleConnectionUpdate(connection.id, "accepted")}
                      className="h-9 px-4 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleConnectionUpdate(connection.id, "declined")}
                      className="h-9 px-4 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </Button>
                  </div>
                )}

                {connection.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="aurora"
                    onClick={() => handleOpenChat(connection)}
                    className="h-9 px-5 text-xs flex-shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Open Chat</span>
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
