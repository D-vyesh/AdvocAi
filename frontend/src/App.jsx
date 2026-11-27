import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import LiquidGlassCursor from "./Components/LiquidGlassCursor";
import AmbientGlassBackdrop from "./Components/AmbientGlassBackdrop";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerConnect from "./pages/LawyerConnect";
import LawyerProfile from "./pages/LawyerProfile";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import MyDocuments from "./pages/MyDocuments";
import DocumentCreation from "./pages/DocumentCreation";
import DocumentVersions from "./pages/DocumentVersions";
import SharedDocumentView from "./pages/SharedDocumentView";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-[#060914] text-white overflow-x-hidden selection:bg-cyan-400/30 selection:text-white">
      {/* Lush Fluffy Aurora & Floating Glass Bubbles Backdrop */}
      <AmbientGlassBackdrop />

      {/* Interactive Liquid Glass Cursor Lens & Ripple System */}
      <LiquidGlassCursor />

      {/* Floating Glass Dock Navigation */}
      {shouldShowNavbar && <Navbar />}

      {/* Main Workspace Viewport */}
      <main className="relative z-10 w-full flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/document-analyser"
            element={(
              <ProtectedRoute>
                <DocumentAnalyzer />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/document-analyser/:id"
            element={(
              <ProtectedRoute>
                <DocumentAnalyzer />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/document-creation"
            element={(
              <ProtectedRoute>
                <DocumentCreation />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/document-creation/:id"
            element={(
              <ProtectedRoute>
                <DocumentCreation />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/document-versions/:id"
            element={(
              <ProtectedRoute>
                <DocumentVersions />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/lawyer-connect"
            element={(
              <ProtectedRoute>
                <LawyerConnect />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/lawyer-profile/:id"
            element={(
              <ProtectedRoute>
                <LawyerProfile />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/lawyer-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/chat"
            element={(
              <ProtectedRoute>
                <ChatList />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/chat/:conversationId"
            element={(
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/my-documents"
            element={(
              <ProtectedRoute>
                <MyDocuments />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin-dashboard"
            element={(
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/verify-otp"
            element={<VerifyOtp />}
          />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/documentShare/:id"
            element={(
              <ProtectedRoute>
                <SharedDocumentView />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'linear-gradient(145deg, rgba(24, 38, 72, 0.85), rgba(12, 20, 42, 0.92))',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.55), 0 18px 40px rgba(0, 0, 0, 0.55), 0 0 24px rgba(0, 212, 255, 0.2)',
            color: '#fff',
            borderRadius: '9999px',
            padding: '11px 22px',
            fontWeight: 600,
          },
        }}
      />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
