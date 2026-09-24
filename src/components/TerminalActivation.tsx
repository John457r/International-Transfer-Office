import React, { useState, useRef, useEffect } from "react";
import { User } from "../types";
import { ShieldAlert, ShieldCheck, MessageSquare, Loader2, KeyRound, Cpu, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface TerminalActivationProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
}

export default function TerminalActivation({ user, onSuccess }: TerminalActivationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Focus next input box
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = otp.join("");
    if (pin.length !== 6) {
      setError("Please enter the complete 6-digit Activation PIN.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/verify-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          pin
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid Activation PIN. Please contact your Account Manager via Live Chat.");
        toast.error("Terminal verification failed. Check PIN and retry.");
        setLoading(false);
        return;
      }

      // Success animation trigger
      setIsSuccess(true);
      toast.success("Terminal successfully activated and authorized!");

      const updatedUser: User = {
        ...user,
        ...data.user,
        isTerminalVerified: true
      };

      // Allow 1.2s for smooth 'Terminal Verified' animation before revealing transfer form
      setTimeout(() => {
        onSuccess(updatedUser);
      }, 1200);

    } catch (err) {
      setError("Network error communicating with the terminal verification gateway.");
      setLoading(false);
    }
  };

  const openLiveChat = () => {
    window.dispatchEvent(new CustomEvent("open-support-chat"));
    window.dispatchEvent(new CustomEvent("open-live-chat"));
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="bg-[#121824] rounded-xl p-10 border-2 border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.25)] text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-sm pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-emerald-950/70 text-emerald-400 border-2 border-emerald-500/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                Terminal Verified
              </h2>
              <p className="text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-4">
                Hardware Node Authorized • Outbound Transfer Gateway Active
              </p>
              <p className="text-[#8E9BAE] text-xs max-w-md mx-auto leading-relaxed">
                Your device signature has been validated against your International Transfer Office account credentials. Initializing transfer portal...
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="activation-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-[#121824] rounded-xl border border-[#1E2638] shadow-2xl overflow-hidden"
          >
            {/* Header / Security Alert Badge */}
            <div className="p-6 sm:p-8 border-b border-[#1E2638] bg-gradient-to-b from-[#0B0F17]/80 to-[#121824]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-[#F59E0B] border border-amber-500/40 flex items-center justify-center font-black shadow-lg">
                    <ShieldAlert size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      Secure Terminal Activation
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-[#8E9BAE] uppercase tracking-widest">
                      KYC Compliance & Device Authorization
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#0B0F17] border border-[#1E2638] text-[9px] font-mono text-amber-400 font-bold uppercase">
                  <Cpu size={12} />
                  <span>Node: Restricted</span>
                </div>
              </div>

              {/* Exact Warning Message required */}
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <div className="flex items-start gap-3">
                  <KeyRound size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-200 uppercase tracking-tight">
                      Device Verification Required. Please contact your Account Manager via Live Chat to receive your one-time Activation PIN.
                    </p>
                    <p className="text-[10px] text-amber-300/80 mt-1">
                      Outbound transfers are locked until the 6-digit terminal authorization key is verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Form Body */}
            <form onSubmit={handleVerify} className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[#8E9BAE]">
                    Enter 6-Digit Activation PIN
                  </label>
                  <span className="text-[9px] font-mono text-slate-400">
                    Account: <strong className="text-white">{user.accountNumber}</strong>
                  </span>
                </div>

                {/* Sleek 6-digit OTP Inputs */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      autoComplete="off"
                      className={`h-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-lg outline-none transition-all ${
                        error
                          ? "bg-[#0B0F17] text-white border-2 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          : digit
                          ? "bg-[#0B0F17] text-[#F59E0B] border-2 border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                          : "bg-[#0B0F17] text-white border border-[#1E2638] hover:border-slate-600 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-bold text-red-400 mt-3 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#FF9500] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F17] font-black uppercase tracking-widest text-xs rounded transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-[#1E2638] active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Validating Terminal Handshake...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Unlock Transfer Terminal</span>
                    </>
                  )}
                </button>

                {/* Direct Action button to open Live Chat widget */}
                <button
                  type="button"
                  onClick={openLiveChat}
                  className="w-full py-3 bg-[#0B0F17] hover:bg-[#1E2638]/60 text-white border border-[#1E2638] hover:border-[#F59E0B]/40 font-bold uppercase tracking-widest text-[10px] rounded transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow"
                >
                  <MessageSquare size={14} className="text-[#F59E0B]" />
                  <span>Request Activation PIN via Live Chat</span>
                </button>
              </div>

              {/* Terminal Encryption Footer */}
              <div className="pt-4 border-t border-[#1E2638] flex items-center justify-between text-[9px] font-mono text-[#8E9BAE]">
                <span>Status: <strong className="text-amber-400">Restricted Mode</strong></span>
                <span>Security: <strong>TLS 1.3 / OTP-256</strong></span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
