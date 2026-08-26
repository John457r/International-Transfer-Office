import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ComplianceHoldPage from "./pages/ComplianceHoldPage";
import Dashboard from "./pages/Dashboard";
import TransferPage from "./pages/TransferPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CollectionPage from "./pages/CollectionPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTransfers from "./pages/AdminTransfers";
import AdminCollections from "./pages/AdminCollections";
import AdminCardRequests from "./pages/AdminCardRequests";
import CardRequestPage from "./pages/CardRequestPage";
import AdminSettings from "./pages/AdminSettings";
import Layout from "./components/Layout";
import WhatsAppButton from "./components/WhatsAppButton";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("ito_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      try {
        const response = await fetch(`/api/user/${user.id}`);
        if (response.ok) {
          const freshData = await response.json();
          setUser((currentUser) => {
            if (!currentUser) return freshData;
            
            // Create comparable objects
            const currentObj = {
              ...currentUser,
              balance: Number(currentUser.balance)
            };
            const freshObj = {
              ...freshData,
              balance: Number(freshData.balance)
            };

            if (JSON.stringify(currentObj) !== JSON.stringify(freshObj)) {
              localStorage.setItem("ito_user", JSON.stringify(freshData));
              return freshData;
            }
            return currentUser;
          });
        }
      } catch (e) {
        // Silently ignore network errors during background polling
        // to prevent console spam if the connection drops temporarily.
      }
    };

    syncUser();
    const interval = setInterval(syncUser, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("ito_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ito_user");
  };

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Landing and Public Pages */}
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={!user ? <LoginPage onLogin={login} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <RegisterPage onRegister={login} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        
        {/* User Routes */}
        <Route element={user && user.role === 'user' ? (
          user.status === 'Pending Admin Review' ? (
            <ComplianceHoldPage user={user} onLogout={logout} />
          ) : (
            <Layout user={user} onLogout={logout} />
          )
        ) : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard user={user!} />} />
          <Route path="/transfer" element={<TransferPage user={user!} />} />
          <Route path="/transactions" element={<TransactionsPage user={user!} />} />
          <Route path="/profile" element={<ProfilePage user={user!} />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/collection" element={<CollectionPage user={user!} />} />
          <Route path="/card-request" element={<CardRequestPage user={user!} />} />
        </Route>

        {/* Admin Routes */}
        <Route element={user && user.role === 'admin' ? <Layout user={user} onLogout={logout} /> : <Navigate to="/login" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/transfers" element={<AdminTransfers />} />
          <Route path="/admin/collections" element={<AdminCollections />} />
          <Route path="/admin/card-requests" element={<AdminCardRequests />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <WhatsAppButton />
    </Router>
  );
}
