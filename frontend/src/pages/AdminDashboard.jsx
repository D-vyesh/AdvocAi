import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/Select";
import { Shield, UserPlus, UserCheck } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState("admin");
  const [newAdmin, setNewAdmin] = useState({ email: "", username: "", name: "", password: "" });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      toast.error("Admin credentials required.");
      navigate("/");
    }
  }, [user, navigate]);

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
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-8 animate-fade-in">

      {/* Header Card */}
      <div className="glass-panel glass-reactive p-8 rounded-[2.5rem] border border-white/25 shadow-fluffy flex items-center gap-4">
        <div className="relative z-10 flex items-center gap-4">
          <div className="glass-circle w-14 h-14 shadow-glass-glow flex-shrink-0">
            <Shield className="w-7 h-7 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">Admin Console</h1>
            <p className="text-xs sm:text-sm text-slate-300/80">Manage administrative privileges and user escalations</p>
          </div>
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
              <h3 className="text-lg font-bold text-white font-display">Promote Member</h3>
              <p className="text-xs text-slate-300/80">Elevate an existing client account</p>
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
