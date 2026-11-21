import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/Card";
import { Button } from "@/Components/ui/button";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState("admin");
  const [newAdmin, setNewAdmin] = useState({ email: "", username: "", name: "", password: "" });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      toast.error("This dashboard is only available to admin users.");
      navigate("/");
    }
  }, [user, navigate]);

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    if (!promoteEmail) {
      toast.error("Please enter an email to promote.");
      return;
    }
    try {
      const response = await axios.post("api/auth/admin/users/promote/", {
        email: promoteEmail,
        role: promoteRole,
      });
      toast.success(response.data?.message || "User promoted successfully.");
      setPromoteEmail("");
      setPromoteRole("admin");
    } catch (err) {
      console.error("Failed to promote user:", err);
      toast.error(err.response?.data?.error || "Unable to promote user.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { email, username, password } = newAdmin;
    if (!email || !username || !password) {
      toast.error("Email, username, and password are required.");
      return;
    }
    try {
      const response = await axios.post("api/auth/admin/users/create-admin/", newAdmin);
      toast.success(response.data?.message || "Admin user created.");
      setNewAdmin({ email: "", username: "", name: "", password: "" });
    } catch (err) {
      console.error("Failed to create admin user:", err);
      const data = err.response?.data;
      let msg = data?.error || "Unable to create admin user.";
      if (typeof data === "object" && !data.error) {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        if (Array.isArray(firstVal) && firstVal.length > 0) {
          msg = firstVal[0];
        } else if (typeof firstVal === "string") {
          msg = firstVal;
        }
      }
      toast.error(msg);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-10 animate-fade-in space-y-8 max-w-4xl">
      <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Admin Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage admin users and permissions.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Promote User</CardTitle>
            <CardDescription className="text-muted-foreground">
              Promote an existing user to admin or client role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handlePromoteUser}>
              <input
                type="email"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                placeholder="User email"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <select
                value={promoteRole}
                onChange={(e) => setPromoteRole(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
              <Button type="submit" className="w-full">
                Promote
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Create Admin User</CardTitle>
            <CardDescription className="text-muted-foreground">
              Add a new administrator account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreateAdmin}>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Email"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <input
                type="text"
                value={newAdmin.username}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Username"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <input
                type="text"
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name (optional)"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <input
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Password"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <Button type="submit" className="w-full">
                Create Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


