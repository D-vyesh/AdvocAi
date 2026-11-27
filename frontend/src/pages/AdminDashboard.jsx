import React, { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/Select";
import { Shield, UserPlus, UserCheck, Scale, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [lawyers, setLawyers] = useState([]);
  const [lawyerStatusFilter, setLawyerStatusFilter] = useState("pending");
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState("admin");
  const [newAdmin, setNewAdmin] = useState({ email: "", username: "", name: "", password: "" });

  const loadLawyers = useCallback(async () => {
    setLoadingLawyers(true);
    try {
      const query = lawyerStatusFilter && lawyerStatusFilter !== "all" ? `?status=${lawyerStatusFilter}` : "";
      const response = await axios.get(`api/auth/admin/lawyers/${query}`);
      setLawyers(response.data || []);
    } catch (err) {
      console.error("Failed to load lawyers for admin:", err);
      toast.error(err.response?.data?.error || "Unable to load lawyers.");
    } finally {
      setLoadingLawyers(false);
    }
  }, [lawyerStatusFilter]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      toast.error("Admin credentials required.");
      navigate("/");
      return;
    }
    loadLawyers();
  }, [user, navigate, loadLawyers]);

  const handleVerifyLawyer = async (lawyerUserId, verification_status) => {
    if (!lawyerUserId) return;
    try {
      const response = await axios.patch(`api/auth/admin/lawyers/${lawyerUserId}/verify/`, {
        verification_status,
      });
      toast.success(response.data?.message || "Lawyer verification updated.");
      loadLawyers();
    } catch (err) {
      console.error("Failed to verify lawyer:", err);
      toast.error(err.response?.data?.error || "Unable to update lawyer status.");
    }
  };

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    if (!promoteEmail) {
      toast.error("Please enter user email.");
      return;
    }
    try {
      const response = await axios.post("api/auth/admin/users/promote/", {
        email: promoteEmail,
        role: promoteRole,
      });
      toast.success(response.data?.message || "User role updated.");
      setPromoteEmail("");
      setPromoteRole("admin");
      if (promoteRole === "lawyer") {
        loadLawyers();
      }
    } catch (err) {
      console.error("Failed to promote user:", err);
      toast.error(err.response?.data?.error || "Unable to update role.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { email, username, password } = newAdmin;
    if (!email || !username || !password) {
      toast.error("Email, username, and password required.");
      return;
    }
    try {
      const response = await axios.post("api/auth/admin/users/create-admin/", newAdmin);
      toast.success(response.data?.message || "Admin user provisioned.");
      setNewAdmin({ email: "", username: "", name: "", password: "" });
    } catch (err) {
      console.error("Failed to create admin:", err);
      toast.error(err.response?.data?.error || "Failed to create administrator.");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-8 animate-fade-in">

      {/* Header Card */}
      <div className="glass-panel glass-reactive p-8 rounded-[2.5rem] border border-white/25 shadow-fluffy flex items-center gap-4">
        <div className="relative z-10 flex items-center gap-4">
          <div className="glass-circle w-14 h-14 shadow-glass-glow flex-shrink-0">
            <Shield className="w-7 h-7 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">Admin Console</h1>
            <p className="text-xs sm:text-sm text-slate-300/80">
              Verify lawyer credentials, manage RBAC roles, and provision administrators
            </p>
          </div>
        </div>
      </div>

      {/* Lawyer Verification Queue */}
      <div className="glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/25 shadow-fluffy space-y-5">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="glass-circle w-11 h-11">
              <Scale className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Lawyer Verification Queue</h2>
              <p className="text-xs text-slate-300/80">
                Approve or reject legal professionals before they appear in Lawyer Connect
              </p>
            </div>
          </div>

          <div className="w-44">
            <Select value={lawyerStatusFilter} onValueChange={setLawyerStatusFilter}>
              <SelectTrigger className="h-10 text-xs rounded-full">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Lawyers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {loadingLawyers ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Loading lawyer applications...</span>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="glass-subtle rounded-2xl p-8 text-center text-xs text-slate-300">
              No lawyer applications found for this filter.
            </div>
          ) : (
            lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="glass-subtle rounded-3xl p-5 border border-white/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-white font-display">
                      {lawyer.user?.name || lawyer.user?.username || "Lawyer Applicant"}
                    </h3>
                    <span
                      className={`glass-pill px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        lawyer.verification_status === "approved"
                          ? "text-emerald-300 border-emerald-300/40"
                          : lawyer.verification_status === "rejected"
                          ? "text-rose-300 border-rose-300/40"
                          : "text-amber-300 border-amber-300/40"
                      }`}
                    >
                      {lawyer.verification_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300/90">{lawyer.user?.email}</p>

                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-300/80 pt-1">
                    <span>License: <strong className="text-white">{lawyer.license_number}</strong></span>
                    <span>Bar Council: <strong className="text-white">{lawyer.bar_council_id}</strong></span>
                    {lawyer.law_firm && <span>Firm: <strong className="text-white">{lawyer.law_firm}</strong></span>}
                    {typeof lawyer.experience_years === "number" && (
                      <span>Exp: <strong className="text-white">{lawyer.experience_years} yrs</strong></span>
                    )}
                  </div>

                  {Array.isArray(lawyer.specializations) && lawyer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lawyer.specializations.map((spec, idx) => (
                        <span key={idx} className="glass-pill px-2.5 py-0.5 text-[10px] text-cyan-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {lawyer.bio && (
                    <p className="text-xs text-slate-300/80 pt-1 line-clamp-2">{lawyer.bio}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {lawyer.verification_status !== "approved" && (
                    <Button
                      size="sm"
                      variant="emerald"
                      onClick={() => handleVerifyLawyer(lawyer.user?.id, "approved")}
                      className="h-9 px-4 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                  )}
                  {lawyer.verification_status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerifyLawyer(lawyer.user?.id, "rejected")}
                      className="h-9 px-4 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Role Promotion */}
        <div className="glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/25 shadow-fluffy space-y-5">
          <div className="relative z-10 flex items-center gap-3">
            <div className="glass-circle w-11 h-11">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Promote / Assign Role</h3>
              <p className="text-xs text-slate-300/80">Assign Client, Lawyer, or Administrator access</p>
            </div>
          </div>

          <form className="relative z-10 space-y-4" onSubmit={handlePromoteUser}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 pl-1">Target Email</label>
              <Input
                type="email"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                placeholder="colleague@domain.com"
                className="h-11 px-4 text-xs rounded-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 pl-1">Assign Role</label>
              <Select value={promoteRole} onValueChange={setPromoteRole}>
                <SelectTrigger className="h-11 px-4 text-xs rounded-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="lawyer">Verified Lawyer</SelectItem>
                  <SelectItem value="client">Standard Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="aurora" className="w-full h-11 text-xs">
              Update Role
            </Button>
          </form>
        </div>

        {/* Card 2: Create Admin */}
        <div className="glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/25 shadow-fluffy space-y-5">
          <div className="relative z-10 flex items-center gap-3">
            <div className="glass-circle w-11 h-11">
              <UserPlus className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Provision Admin</h3>
              <p className="text-xs text-slate-300/80">Directly register a new administrator</p>
            </div>
          </div>

          <form className="relative z-10 space-y-3.5" onSubmit={handleCreateAdmin}>
            <Input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
              className="h-10 px-4 text-xs rounded-full"
            />
            <Input
              type="text"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Username"
              className="h-10 px-4 text-xs rounded-full"
            />
            <Input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name (optional)"
              className="h-10 px-4 text-xs rounded-full"
            />
            <Input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Secure password"
              className="h-10 px-4 text-xs rounded-full"
            />

            <Button type="submit" variant="default" className="w-full h-11 text-xs mt-2">
              Provision Account
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
