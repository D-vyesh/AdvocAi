import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { User, LogOut, Menu, X, Sparkles, ChevronRight, Droplets } from "lucide-react";
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cursorFxOn, setCursorFxOn] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("advocai-liquid-cursor");
    return saved === null ? true : saved === "true";
  });
  const profileMenuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  const toggleCursorFx = () => {
    const next = !cursorFxOn;
    setCursorFxOn(next);
    window.dispatchEvent(new CustomEvent("advocai:toggle-cursor", { detail: next }));
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/document-analyser", label: "Analyzer" },
    { to: "/document-creation", label: "Generator" },
    { to: "/my-documents", label: "Documents", requiresAuth: true },
  ];

  if (isAuthenticated && user?.role === 'admin') {
    navLinks.push({ to: "/admin-dashboard", label: "Admin", requiresAuth: true });
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3.5 pb-2 pointer-events-none">
      {/* Floating Fluffy Liquid Glass Dock */}
      <div className="max-w-6xl mx-auto glass-dock glass-reactive pointer-events-auto px-4 sm:px-6 py-2.5 transition-all duration-300">
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Logo with Specular Dewdrop Brand Orb */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none cursor-glass-target"
          >
            <div className="glass-circle w-10 h-10 p-1.5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.92),0_6px_18px_rgba(0,212,255,0.38)] group-hover:scale-110 transition-transform duration-300 ease-fluffy">
              <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-cyan-300 bg-clip-text text-transparent font-display">
              Advoc<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation - Plush Cushion Segmented Pills */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            {navLinks.map((link, index) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={index}
                  to={link.to}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ease-fluffy ${
                    isActive
                      ? "bg-gradient-to-b from-white/30 to-cyan-400/15 text-white border border-white/45 shadow-[inset_0_2px_2px_rgba(255,255,255,0.85),0_6px_16px_rgba(0,212,255,0.28)] scale-[1.03]"
                      : "text-slate-300 hover:text-white hover:bg-white/12 hover:-translate-y-0.5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Liquid Glass Cursor Lens Quick Toggle */}
            <Button
              type="button"
              onClick={toggleCursorFx}
              variant="glass-circle"
              size="icon-sm"
              className={`w-9 h-9 ${
                cursorFxOn
                  ? "text-cyan-300 border-cyan-300/50 shadow-[0_0_16px_rgba(0,212,255,0.32)]"
                  : "text-slate-400 opacity-75"
              }`}
              title={cursorFxOn ? "Liquid Glass Cursor: ON (click to toggle)" : "Liquid Glass Cursor: OFF (click to toggle)"}
              aria-label="Toggle Liquid Glass Cursor"
            >
              <Droplets className="w-4 h-4" />
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5" ref={profileMenuRef}>
                <Link
                  to="/profile"
                  className="glass-circle w-10 h-10 p-0.5 hover:scale-105 transition-transform"
                  title="Your Profile"
                >
                  {user && user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-cyan-300" />
                  )}
                </Link>

                <Button
                  onClick={logout}
                  variant="destructive"
                  size="sm"
                  className="h-9 px-4 text-xs"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="aurora"
                size="sm"
                className="h-9 px-5 text-xs"
              >
                <Link to="/login">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="glass-circle"
              size="icon-sm"
              className="w-9 h-9 text-slate-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Ultra Frosted Fluffy Glass Panel) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-50 glass-panel glass-reactive p-6 shadow-2xl animate-fade-in pointer-events-auto border border-white/30">
          <div className="relative z-10 flex flex-col space-y-2.5">
            {navLinks.map((link, index) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={index}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-white/25 text-white border border-white/40 shadow-[inset_0_2px_2px_rgba(255,255,255,0.75)]"
                      : "text-slate-200 hover:bg-white/12"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight size={16} className="text-cyan-300" />
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/15">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-200 hover:bg-white/10"
                  >
                    <div className="glass-circle w-8 h-8">
                      <User size={16} className="text-cyan-300" />
                    </div>
                    <span className="font-semibold text-sm">Account Settings</span>
                  </Link>

                  <Button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    variant="destructive"
                    className="w-full h-11 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button asChild variant="aurora" className="w-full h-11 text-sm">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
