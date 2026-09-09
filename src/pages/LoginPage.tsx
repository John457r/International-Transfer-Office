import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded Admin Login for immediate access
    if (username === "johnfidelis550@gmail.com" && password === "Fidelis90@") {
      const adminUser: User = {
        id: "2",
        username: "johnfidelis550@gmail.com",
        name: "System Administrator",
        balance: 0,
        accountNumber: "ADMIN-001",
        role: "admin",
        status: "active",
        currency: "USD",
        currencyApproved: true,
        transfersEnabled: true,
        tc: "000000",
        vc: "000000",
        sc: "000000"
      };
      onLogin(adminUser);
      toast.success(`Welcome back, ${adminUser.name}`);
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
        toast.success(`Welcome back, ${data.user.name}`);
        if (data.user.status === "Pending Admin Review") {
          navigate('/dashboard'); // Will load compliance hold directly
        } else {
          navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#F59E0B] blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F59E0B] blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md p-10 bg-[#121824] rounded-xl shadow-2xl relative z-10 mx-4 border border-[#1E2638]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0B0F17] text-[#F59E0B] rounded-none mb-6 border-2 border-[#F59E0B] shadow-[4px_4px_0px_0px_#F59E0B]">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">INTERNET SUPPORT TEAM</h1>
          <p className="text-[#F59E0B] font-bold tracking-[0.3em] uppercase text-[10px] mt-2">Internet Support Team</p>
          <div className="h-0.5 w-12 bg-[#F59E0B] mx-auto mt-6"></div>
          <p className="text-[#8E9BAE] mt-4 font-bold uppercase tracking-widest text-[9px]">Secure Access Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Username / Email</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E9BAE] group-focus-within:text-[#F59E0B] transition-colors" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-black font-semibold rounded outline-none placeholder:text-[#8E9BAE]"
                placeholder="ENTER USERNAME"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E9BAE] group-focus-within:text-[#F59E0B] transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-black font-semibold rounded outline-none placeholder:text-[#8E9BAE]"
                placeholder="ENTER PASSWORD"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#F59E0B] text-[#0B0F17] font-extrabold rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-[#FF9500] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-5 disabled:opacity-70 uppercase tracking-[0.2em] text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <ShieldCheck size={20} />
                Authorize Login
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center space-y-3">
          <p className="text-[10px] text-[#8E9BAE] uppercase tracking-wider">
            New Client?{" "}
            <Link to="/register" className="text-[#F59E0B] font-bold hover:underline">
              Create Secure Portfolio Account
            </Link>
          </p>
          <p className="text-[9px] text-[#8E9BAE] uppercase tracking-[0.2em]">
            256-bit Military Grade Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
