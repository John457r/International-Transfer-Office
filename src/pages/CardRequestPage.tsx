import React, { useState } from "react";
import { User } from "../types";
import { CreditCard, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CardRequestPageProps {
  user: User;
}

export default function CardRequestPage({ user }: CardRequestPageProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    address: "",
    phone: user.phone || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/card-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Card request submitted successfully");
      } else {
        toast.error("Failed to submit card request");
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-500/30 mb-4 shadow-lg">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Request Received</h1>
        <p className="text-slate-400 max-w-md mx-auto font-medium text-xs leading-relaxed uppercase font-mono">
          Your ATM card request has been submitted. Our team will verify your address and contact details before shipping your personalized card.
        </p>
        <div className="pt-8">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-[#3B82F6] text-[#0F172A] font-black rounded uppercase tracking-widest border border-[#3B82F6]/35 hover:bg-[#60A5FA] transition-all"
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
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Request ATM Card</h1>
        <p className="text-slate-400 text-xs">Get a physical card for global ATM withdrawals and point-of-sale payments.</p>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/25 overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-12 bg-[#0F172A] text-[#3B82F6] rounded flex items-center justify-center border border-[#3B82F6]/30">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-white uppercase tracking-tight">Card Delivery Details</h3>
              <p className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-wider">Provide your shipping address and contact information.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">Card Holder Name</label>
              <input
                type="text"
                disabled
                value={formData.name}
                className="w-full px-4 py-3 bg-slate-300 text-slate-700 cursor-not-allowed font-bold text-xs select-none border border-[#3B82F6]/20 rounded"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-5.5 text-slate-500" size={18} />
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black text-xs font-black placeholder:text-slate-405 border border-[#3B82F6]/35 rounded focus:border-[#3B82F6]"
                  placeholder="Enter your full residential address"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-white text-black text-xs font-black placeholder:text-slate-405 border border-[#3B82F6]/35 rounded focus:border-[#3B82F6]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#3B82F6] text-[#0F172A] font-black rounded uppercase tracking-widest hover:bg-[#60A5FA] transition-all flex items-center justify-center gap-3 disabled:opacity-70 border border-[#3B82F6]/30 shadow-lg cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Request My Card"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
