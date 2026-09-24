import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, MessageSquare, Clock, Lock, CheckCircle2, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { User } from "../types";

interface ComplianceHoldPageProps {
  onLogout: () => void;
  user: User;
  onUserUpdated?: (user: User) => void;
}

export default function ComplianceHoldPage({ onLogout, user, onUserUpdated }: ComplianceHoldPageProps) {
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const navigate = useNavigate();

  // Background auto-detection: if the Support Team activates the account in the panel,
  // automatically unlock and transition the user to the dashboard without manual reload
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/user/${user.id}`);
        if (res.ok) {
          const freshData: User = await res.json();
          const isStillRestricted = freshData.isBlocked || 
            freshData.status === 'Pending Support Review' || 
            freshData.status === 'Pending Admin Review' || 
            freshData.status === 'HOLD';

          if (!isStillRestricted && isMounted) {
            setUnlockedSuccess(true);
            toast.success("Account verified & activated by Support Team!");
            if (onUserUpdated) onUserUpdated(freshData);
            window.dispatchEvent(new CustomEvent('user-updated', { detail: freshData }));
            setTimeout(() => {
              navigate("/dashboard");
            }, 1200);
          }
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user.id, navigate, onUserUpdated]);

  const handleOpenSupport = () => {
    window.dispatchEvent(new CustomEvent('open-support-chat'));
    window.dispatchEvent(new CustomEvent('open-live-chat'));
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit Activation PIN provided by your Account Manager");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/user/verify-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, pin: cleanPin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUnlockedSuccess(true);
        toast.success("Terminal verified and activated successfully!");
        if (onUserUpdated) onUserUpdated(data.user);
        window.dispatchEvent(new CustomEvent('user-updated', { detail: data.user }));
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        toast.error(data.message || "Invalid Activation PIN. Please contact your Account Manager via Live Chat.");
      }
    } catch (err) {
      toast.error("Network verification error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (unlockedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-md bg-[#121824] rounded-xl border border-emerald-500/40 p-10 shadow-2xl space-y-5">
          <div className="w-20 h-20 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Terminal Activated</h2>
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
            Verification Complete • Opening Secure Dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] p-6 relative overflow-hidden">
      {/* Background visual ambience */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#F59E0B]/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl bg-[#121824] rounded-xl border-2 border-amber-500/30 shadow-2xl p-8 sm:p-12 relative z-10 text-center">
        {/* Security Radar Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-[#0B0F17] text-[#F59E0B] rounded-full mb-6 border-2 border-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <ShieldAlert size={38} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          Terminal Pending Activation
        </h1>
        
        {/* Mandatory Security Notice Banner */}
        <div className="mt-4 p-4 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 font-semibold text-xs sm:text-sm leading-relaxed max-w-xl mx-auto shadow-inner">
          Terminal Pending Activation. Please contact the Support Team via Live Chat to complete your verification and unlock your account.
        </div>

        {/* Custom Directive if set by Support Team */}
        {user.customError && (
          <div className="max-w-md mx-auto bg-red-950/50 border border-red-500/30 p-4 rounded text-left mt-5 text-xs font-semibold text-red-300 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Lock className="text-red-400 shrink-0 mt-0.5" size={14} />
              <div>
                <p className="font-extrabold uppercase text-[8px] tracking-wider text-red-400 mb-0.5">SUPPORT TEAM DIRECTIVE:</p>
                <p className="leading-normal font-mono uppercase text-[10px]">{user.customError}</p>
              </div>
            </div>
            <button 
              onClick={handleOpenSupport}
              className="w-full px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded text-[8px] font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              Connect with Support Team
            </button>
          </div>
        )}

        <div className="h-0.5 w-24 bg-amber-500/30 mx-auto mt-6"></div>

        {/* Informative Security Grid */}
        <div className="bg-[#0B0F17]/70 rounded-xl p-6 my-6 text-left border border-[#1E2638] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock size={15} className="text-[#F59E0B]" /> Security Gateway Clearance
            </h2>
            <span className="px-2 py-0.5 bg-amber-500/10 text-[#F59E0B] border border-amber-500/20 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Pending Support Review
            </span>
          </div>
          
          <div className="space-y-2 text-xs text-[#8E9BAE] leading-relaxed">
            <p>
              Your portfolio application has been provisioned under identifier <span className="font-mono text-[#F59E0B] font-bold">{user.accountNumber}</span>.
            </p>
            <p>
              To maintain alignment with institutional clearing guidelines, this terminal remains locked behind an anti-fraud security gate. Your assigned <span className="text-white font-semibold">Account Manager</span> and <span className="text-white font-semibold">Support Team</span> are available via Live Chat to inspect your clearance file and activate your account.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1E2638] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-[#121824]/60 p-3.5 rounded border border-[#1E2638]">
              <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Verification Node</span>
              <span className="text-[#F59E0B] text-xs font-bold uppercase mt-1 block">Support Desk Queue</span>
            </div>
            <div className="bg-[#121824]/60 p-3.5 rounded border border-[#1E2638]">
              <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Base Currency</span>
              <span className="text-white text-xs font-bold font-mono mt-1 block">{user.currency || 'USD'}</span>
            </div>
            <div className="bg-[#121824]/60 p-3.5 rounded border border-[#1E2638]">
              <span className="block text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">Jurisdiction</span>
              <span className="text-slate-200 text-xs font-bold uppercase mt-1 block">{user.country || 'Papua New Guinea'}</span>
            </div>
          </div>
        </div>

        {/* PIN Entry Collapsible Box */}
        {showPinInput ? (
          <form onSubmit={handleVerifyPin} className="mb-6 p-5 bg-[#0B0F17] rounded-xl border border-amber-500/30 text-left space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <KeyRound size={14} className="text-[#F59E0B]" /> Enter 6-Digit Activation PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPinInput(false)}
                className="text-[9px] text-[#8E9BAE] hover:text-white underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <p className="text-[10px] text-[#8E9BAE]">
              If your Account Manager provided you with an Activation PIN via Live Chat, enter it below to authorize this terminal immediately.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-2.5 bg-[#121824] text-white font-mono font-bold tracking-[0.5em] text-center text-lg rounded border border-[#1E2638] focus:border-[#F59E0B] outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={verifying || pin.length !== 6}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#FF9500] disabled:opacity-50 text-[#0B0F17] font-black uppercase text-xs tracking-wider rounded transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow"
              >
                {verifying ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Unlock
              </button>
            </div>
          </form>
        ) : null}

        {/* Action Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenSupport}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#F59E0B] text-[#0B0F17] font-black text-xs uppercase tracking-widest hover:bg-[#FF9500] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-[#1E2638] cursor-pointer active:scale-95"
            >
              <MessageSquare size={16} />
              Open Live Chat with Support Team
            </button>

            {!showPinInput && (
              <button
                onClick={() => setShowPinInput(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-[#0B0F17] text-[#F59E0B] hover:text-white border border-amber-500/40 hover:border-amber-500 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound size={14} />
                I Have An Activation PIN
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full sm:w-auto px-5 py-3.5 border border-[#1E2638] text-[#8E9BAE] hover:text-white font-bold text-xs uppercase tracking-widest hover:bg-[#0B0F17] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={14} />
              Log Out
            </button>
          </div>

          <p className="text-[10px] text-[#8E9BAE] font-medium pt-2">
            Real-time listener active: This portal will automatically unlock the moment your Support Team validates your file.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-[9px] text-[#8E9BAE] uppercase tracking-wider flex items-center justify-center gap-1.5">
          <ShieldAlert size={12} className="text-[#F59E0B]" /> 256-bit Institutional TLS Encryption Handshake Active
        </div>
      </div>
    </div>
  );
}

