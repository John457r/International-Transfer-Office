import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User as UserIcon, Mail, Phone, Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "../types";

interface RegisterPageProps {
  onRegister: (user: User) => void;
}

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Papua New Guinea");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, country, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created! Terminal pending Support Team activation.");
        onRegister(data.user);
        navigate("/hold");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] py-12 px-4 relative overflow-hidden">
      {/* Subtle Vector Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B2D13] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/30 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg p-8 bg-[#121824] rounded-xl shadow-2xl relative z-10 border border-[#1E2638]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0B0F17] text-[#F59E0B] rounded-none mb-4 border-2 border-[#F59E0B] shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">INTERNATIONAL GATEWAY</h1>
          <p className="text-[#F59E0B] font-semibold tracking-wider uppercase text-[9px] mt-1">
            Secure Institutional Self-Registration
          </p>
          <div className="h-0.5 w-16 bg-[#F59E0B] mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE]"
                  placeholder="e.g. John Doe / Maria Gari"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE]"
                  placeholder="e.g. name@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE]"
                  placeholder="e.g. +675 7000 0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Country Jurisdiction</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="Papua New Guinea">Papua New Guinea</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Requested Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE]"
                  placeholder="CHOOSE USERNAME"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-[#8E9BAE] uppercase tracking-wider">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold border border-[#1E2638] rounded focus:outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE]"
                  placeholder="CREATE PASSWORD"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F59E0B] text-[#0B0F17] font-bold uppercase tracking-widest text-xs hover:bg-[#FF9500] active:translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-2 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <ShieldCheck size={18} />
                Submit Verification Protocol
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-[10px] text-[#8E9BAE] uppercase tracking-wider">
            Already registered?{" "}
            <Link to="/login" className="text-[#F59E0B] font-bold hover:underline">
              Secure Login HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
