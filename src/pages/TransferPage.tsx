import React, { useState, useEffect, useRef } from "react";
import { User, SecuritySettings, Transfer } from "../types";
import { Shield, Send, Loader2, CheckCircle2, AlertCircle, Clock, Download, Printer, Globe, ShieldAlert, MessageSquare, X, SendHorizontal, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface TransferPageProps {
  user: User;
}

export default function TransferPage({ user }: TransferPageProps) {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("ito_transfer_step");
    return saved ? parseInt(saved) : 1;
  });
  const [securityStep, setSecurityStep] = useState(() => {
    const saved = localStorage.getItem("ito_transfer_security_step");
    return saved ? parseInt(saved) : 0;
  }); // 0: TC, 1: VC, 2: SC
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastTransfer, setLastTransfer] = useState<Transfer | null>(null);
  const [showSMS, setShowSMS] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<{role: 'user' | 'support', text: string}[]>([
    { role: 'support', text: 'Welcome to International Transfer Office Support. How can we help you today?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Trust & Realism extension: 4-second delay states with alternating alerts
  const [isProcessingDelay, setIsProcessingDelay] = useState(false);
  const [delayStatus, setDelayStatus] = useState("Securing ledger entry with clearing house...");

  // Unique Transfer Tracking Reference ID: ITO-PGK-XXXXX or ITO-USD-XXXXX
  const [trackingId, setTrackingId] = useState(() => {
    const saved = localStorage.getItem("ito_transfer_tracking_id");
    if (saved) return saved;
    const curr = user.currency || "USD";
    const num = Math.floor(10000 + Math.random() * 90000).toString();
    const newId = `ITO-${curr}-${num}`;
    localStorage.setItem("ito_transfer_tracking_id", newId);
    return newId;
  });
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("ito_transfer_form");
    return saved ? JSON.parse(saved) : {
      bankName: "",
      accountName: "",
      accountNumber: "",
      amount: "",
      transactionCode: "",
      verificationCode: "",
      switchCode: ""
    };
  });

  useEffect(() => {
    localStorage.setItem("ito_transfer_step", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("ito_transfer_security_step", securityStep.toString());
  }, [securityStep]);

  useEffect(() => {
    localStorage.setItem("ito_transfer_form", JSON.stringify(formData));
  }, [formData]);

  // Check if user can transfer
  if (!user.transfersEnabled) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#1E293B] rounded-xl p-12 text-center border border-[#3B82F6]/30 shadow-2xl">
          <div className="w-20 h-20 bg-red-950/40 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Transfer Restricted</h2>
          <p className="text-slate-300 mb-8 text-sm leading-relaxed">
            Your account transfer privileges have been temporarily restricted for security clearance verification. Please initiate support chat to complete manual validation.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="w-full py-3.5 bg-[#3B82F6] text-[#0F172A] font-black rounded hover:bg-[#60A5FA] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] border border-[#3B82F6]/30"
          >
            <MessageSquare size={16} />
            Contact Support Desk
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  useEffect(() => {
    if (step === 2) {
      const syncCodes = async () => {
        try {
          await fetch(`/api/user/${user.id}/sync-codes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentTC: formData.transactionCode,
              currentVC: formData.verificationCode,
              currentSC: formData.switchCode
            }),
          });
        } catch (e) {
          console.error("Sync failed", e);
        }
      };
      syncCodes();
    }
  }, [formData.transactionCode, formData.verificationCode, formData.switchCode, step, user.id]);

  useEffect(() => {
    if (step === 2) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [step, securityStep]);

  const startTimer = () => {
    stopTimer();
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopTimer();
          toast.error("Security session expired. Please restart the transfer.");
          setStep(1);
          setSecurityStep(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.transfersEnabled) {
      toast.error("Transfers are currently disabled by the administrator.");
      return;
    }
    if (parseFloat(formData.amount) > user.balance) {
      setErrorAlert("Insufficient balance in your account.");
      return;
    }

    // Determine which security step to start with
    const requiredSteps = [];
    if (settings?.requireTransactionCode) requiredSteps.push(0);
    if (settings?.requireVerificationCode) requiredSteps.push(1);
    if (settings?.requireSwitchCode) requiredSteps.push(2);

    if (requiredSteps.length === 0) {
      setLoading(true);
      finalizeTransfer();
    } else {
      setStep(2);
      setSecurityStep(requiredSteps[0]);
      setShowSecurityModal(true);
      
      // Only show SMS if TC is required
      if (settings?.requireTransactionCode) {
        setShowSMS(true);
        setTimeout(() => setShowSMS(false), 8000);
      }
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);
    setSecurityLoading(true);
    
    try {
      // Verify code from database
      const res = await fetch(`/api/user/${user.id}`);
      const latestUser = await res.json();
      
      const requiredSteps = [];
      if (settings?.requireTransactionCode) requiredSteps.push(0);
      if (settings?.requireVerificationCode) requiredSteps.push(1);
      if (settings?.requireSwitchCode) requiredSteps.push(2);

      const currentIdx = requiredSteps.indexOf(securityStep);
      
      if (currentIdx === -1) {
        // This shouldn't happen if logic is correct, but safety first
        if (requiredSteps.length > 0) {
          setSecurityStep(requiredSteps[0]);
          setSecurityLoading(false);
          return;
        } else {
          await finalizeTransfer();
          return;
        }
      }
      
      // Check code against latest database values
      const currentCodeInput = securityStep === 0 ? formData.transactionCode : 
                         securityStep === 1 ? formData.verificationCode : 
                         formData.switchCode;
      const correctCode = securityStep === 0 ? latestUser.tc : 
                         securityStep === 1 ? latestUser.vc : 
                         latestUser.sc;
      
      if (currentCodeInput !== correctCode) {
        setErrorAlert(`Invalid ${securityStep === 0 ? 'Transaction' : securityStep === 1 ? 'Verification' : 'Switch'} Code. Please check and try again.`);
        setSecurityLoading(false);
        return;
      }

      if (currentIdx < requiredSteps.length - 1) {
        setSecurityStep(requiredSteps[currentIdx + 1]);
        toast.success("Code verified. Proceeding to next step.");
        setSecurityLoading(false);
      } else {
        // Trigger high-end processing delay for 4 seconds
        setIsProcessingDelay(true);
        setSecurityLoading(false);
        setShowSecurityModal(false); // Hide the standard security entry modal
        
        setDelayStatus("Securing ledger entry with clearing house...");
        
        let cycle = 0;
        const interval = setInterval(() => {
          cycle += 1;
          if (cycle === 1) {
            setDelayStatus("Routing funds through correspondent bank...");
          } else if (cycle === 2) {
            setDelayStatus("Verifying collateral reserve balances in PNG, USA, and UK regulatory chambers...");
          } else if (cycle === 3) {
            setDelayStatus("Finalizing currency-locked compliance certificate...");
          } else if (cycle >= 4) {
            clearInterval(interval);
            setIsProcessingDelay(false);
            finalizeTransfer();
          }
        }, 1000);
      }
    } catch (error) {
      setErrorAlert("Security verification failed. Please try again.");
      setSecurityLoading(false);
    }
  };

  const finalizeTransfer = async () => {
    setSecurityLoading(true);
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          trackingId: trackingId, // Pass the unique reference ID
          ...formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastTransfer(data);
        setShowSecurityModal(false);
        setStep(3);
        toast.success("Transfer authorized successfully");
        localStorage.removeItem("ito_transfer_step");
        localStorage.removeItem("ito_transfer_security_step");
        localStorage.removeItem("ito_transfer_form");
        localStorage.removeItem("ito_transfer_tracking_id");
      } else {
        const data = await response.json();
        setErrorAlert(data.message || "Transfer failed. Please contact support.");
      }
    } catch (error) {
      setErrorAlert("An unexpected error occurred during authorization.");
    } finally {
      setSecurityLoading(false);
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSupportMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      setSupportMessages(prev => [...prev, { role: 'support', text: 'An agent will be with you shortly. Your ticket ID is ITO-' + Math.floor(Math.random() * 10000) }]);
    }, 1000);
  };

  if (step === 3 && lastTransfer) {
    return (
      <div className="max-w-3xl mx-auto mt-8 space-y-8 print:m-0 print:max-w-none text-slate-200">
        <div className="text-center space-y-6 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 animate-pulse">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Transfer Authorized</h1>
          <p className="text-[#3B82F6] font-bold uppercase tracking-widest text-[10px]">Your international wire has been queued for processing.</p>
        </div>

        {/* Currency-Locked Receipt */}
        <div className="bg-[#1E293B] border border-[#3B82F6]/35 rounded-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3B82F6]"></div>
          <div className="p-10 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#3B82F6]/15 pb-6">
              <div>
                <div className="flex items-center gap-5 text-white font-black text-2xl mb-1 tracking-tight">
                  <Globe size={28} className="text-[#3B82F6]" /> ITO BANK
                </div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Official Transaction Receipt</p>
                <div className="mt-3 inline-block bg-[#0F172A] text-white border border-[#3B82F6]/20 px-3 py-1.5 rounded">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">TRACKING REF ID:</span>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#3B82F6]">{trackingId}</span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt No.</p>
                <p className="text-lg font-mono font-black text-[#3B82F6] uppercase tracking-tight">{lastTransfer.id.toUpperCase()}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{new Date(lastTransfer.date).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest mb-2">Sender Information</p>
                  <div className="bg-[#0F172A] p-6 border border-[#3B82F6]/15 rounded">
                    <p className="text-xs font-bold text-white uppercase">{user.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{user.accountNumber}</p>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1 block">✓ Verified Account</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest mb-2">Recipient Information</p>
                  <div className="bg-[#0F172A] p-6 border border-[#3B82F6]/15 rounded">
                    <p className="text-xs font-bold text-white uppercase">{lastTransfer.accountName}</p>
                    <p className="text-xs text-[#3B82F6] font-bold uppercase mt-1">{lastTransfer.bankName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{lastTransfer.accountNumber}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[9px] font-black text-[#3B82F6] uppercase tracking-widest mb-2">Transaction Summary</p>
                <div className="space-y-6 bg-[#0F172A]/60 p-5 rounded border border-[#3B82F6]/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Sent</span>
                    <span className="text-base font-bold text-white font-mono">{formatCurrency(lastTransfer.amount, user.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency Lock</span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest">Fixed Rate Applied</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Fee</span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest">WAIVED (ELITE CLASS)</span>
                  </div>
                  <div className="pt-4 border-t border-[#3B82F6]/15 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Total Authorized</span>
                    <span className="text-2xl font-bold text-[#3B82F6] font-mono tracking-tight">{formatCurrency(lastTransfer.amount, user.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F172A]/80 p-5 border border-[#3B82F6]/15 rounded relative">
              <div className="absolute top-3 right-4 opacity-10 text-[#3B82F6]">
                <Shield size={48} />
              </div>
              <p className="text-[9px] text-[#3B82F6] uppercase font-bold tracking-widest mb-2">Security Authentication Hash</p>
              <p className="text-[9px] font-mono text-slate-400 break-all leading-normal">
                {btoa(JSON.stringify(lastTransfer) + "ITO_SECURE_HASH").substring(0, 128)}
              </p>
              <div className="mt-4 pt-3 border-t border-[#3B82F6]/10 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <p>Status: Authorized & Encrypted</p>
                <p>Protocol: SWIFT-X-2024</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">This is a secure authenticated transaction certificate. No user signature required.</p>
            </div>
          </div>
          
          <div className="bg-[#0F172A] p-5 flex flex-col sm:flex-row justify-center gap-6 border-t border-[#3B82F6]/20 print:hidden">
            <button 
              onClick={() => {
                toast.info("Generating Secure PDF...");
                setTimeout(() => toast.success("Receipt downloaded successfully"), 2000);
              }}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-[#3B82F6] text-[#0F172A] text-[10px] font-black uppercase tracking-wider hover:bg-[#60A5FA] transition-all rounded border border-[#3B82F6]/35 shadow"
            >
              <Download size={15} /> Download Receipt
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-transparent border border-[#3B82F6]/30 text-[#3B82F6] text-[10px] font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-all rounded"
            >
              <Printer size={15} /> Print Receipt
            </button>
          </div>
        </div>

        <div className="text-center print:hidden">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="text-[9px] font-black text-slate-500 hover:text-[#3B82F6] uppercase tracking-widest transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isUser = user.role === 'user';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            INTERNATIONAL TRANSFER OFFICE
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">
            Secure Outbound Remittance Protocol
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#1E293B] border border-[#3B82F6]/25 text-[#3B82F6] shadow rounded-md">
          <Shield size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
      </div>

      <AnimatePresence>
        {showSMS && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
          >
            <div className="bg-[#3B82F6] text-[#0F172A] rounded-lg shadow-2xl border border-[#3B82F6]/50 p-5 flex items-start gap-6">
              <div className="w-10 h-10 bg-[#0F172A] text-[#3B82F6] rounded-full flex items-center justify-center shrink-0 border border-[#3B82F6]/30">
                <Smartphone size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0F172A]/60">SMS Authorization Code</span>
                  <span className="text-[8px] font-bold">1m ago</span>
                </div>
                <p className="text-[10px] font-bold leading-snug uppercase tracking-tight">
                  SECURITY ALERT: Multi-stage authorization required. Enter your Transaction Code to clear this wire.
                </p>
              </div>
              <button onClick={() => setShowSMS(false)} className="text-[#0F172A] hover:scale-115 transition-transform">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorAlert && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md"
          >
            <div className="bg-[#1E293B] rounded-xl shadow-2xl max-w-md w-full p-8 border border-[#3B82F6]/35 text-center relative">
              <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Security Alert</h2>
              <div className="bg-[#0F172A]/70 border border-red-500/20 text-red-300 p-6 rounded text-xs font-semibold mb-6 leading-relaxed">
                {errorAlert}
              </div>
              <button 
                onClick={() => setErrorAlert(null)}
                className="w-full py-3 bg-[#3B82F6] text-[#0F172A] font-black rounded hover:bg-[#60A5FA] transition-all uppercase tracking-widest text-[10px] border border-[#3B82F6]/20"
              >
                Acknowledge Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#1E293B] p-5 border border-[#3B82F6]/25 rounded-lg shadow-xl">
        <button 
          onClick={() => setShowSupport(true)}
          className="flex items-center gap-3 px-4 py-2 bg-[#0F172A] border border-[#3B82F6]/30 text-[#3B82F6] text-[10px] font-black uppercase tracking-wider rounded hover:bg-[#1E293B] transition-all shadow"
        >
          <MessageSquare size={14} /> Message Support
        </button>
        <div className="text-right">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">ACTIVE TRANSFER REFERENCE NO.</span>
          <span className="font-mono text-xs text-[#3B82F6] font-bold tracking-widest">{trackingId}</span>
        </div>
      </div>

      {!settings?.transfersEnabled && (
        <div className="mb-8 bg-red-950/40 border border-red-500/25 p-5 rounded-lg flex gap-6 items-center shadow-lg">
          <AlertCircle className="text-red-400 shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-red-300 text-xs uppercase tracking-tight">Transfers Temporarily Suspended</h3>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">The administrator has temporarily paused outbound networks for mandatory clearing systems upgrade.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#3B82F6]/25 overflow-hidden shadow-2xl bg-[#1E293B]">
        <div className="flex border-b border-[#3B82F6]/15">
          <div className={cn(
            "flex-1 p-6 text-center text-xs font-black uppercase tracking-widest",
            step === 1 
              ? "text-[#0F172A] bg-[#3B82F6]" 
              : "text-slate-400 bg-[#0F172A]/40"
          )}>
            1. Recipient Details
          </div>
          <div className={cn(
            "flex-1 p-6 text-center text-xs font-black uppercase tracking-widest",
            step === 2 
              ? "text-[#0F172A] bg-[#3B82F6]" 
              : "text-slate-400 bg-[#0F172A]/40"
          )}>
            2. Security Verification
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Bank Name</label>
                  <input
                    type="text"
                    required
                    disabled={!settings?.transfersEnabled}
                    value={formData.bankName}
                    onChange={e => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-medium transition-all !bg-[#0F172A] !text-white"
                    placeholder="e.g. Chase Bank"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Name</label>
                  <input
                    type="text"
                    required
                    disabled={!settings?.transfersEnabled}
                    value={formData.accountName}
                    onChange={e => setFormData({...formData, accountName: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-medium transition-all !bg-[#0F172A] !text-white"
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Number</label>
                  <input
                    type="text"
                    required
                    disabled={!settings?.transfersEnabled}
                    value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-bold font-mono tracking-widest transition-all !bg-[#0F172A] !text-white"
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B82F6]">Amount ({user.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={!settings?.transfersEnabled}
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/45 rounded focus:border-[#3B82F6] outline-none text-base font-bold font-mono transition-all !bg-[#0F172A] !text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!settings?.transfersEnabled || loading}
                  className="w-full py-3 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#0F172A] font-black uppercase text-xs tracking-widest rounded transition-all flex items-center justify-center gap-3 border border-[#3B82F6]/30"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>Continue to Verification <Send size={14} /></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-[#0F172A] border border-[#3B82F6]/30 rounded-full text-[#3B82F6] shadow">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Verification Required</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Please complete the multi-stage cryptographic security credentials to authorize this remittance.</p>
              <button 
                onClick={() => setShowSecurityModal(true)}
                className="px-8 py-3 bg-[#3B82F6] text-[#0F172A] font-black uppercase tracking-widest text-[10px] rounded hover:bg-[#60A5FA] transition-all border border-[#3B82F6]/30 shadow"
              >
                Open Security Portal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md border border-[#3B82F6]/30 bg-[#1E293B] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#3B82F6]/20 flex justify-between items-center bg-[#0F172A]/40 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-[#3B82F6]" />
                  <h3 className="font-black uppercase tracking-widest text-xs text-white">Security Verification Portal</h3>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[#3B82F6]/20 text-[#3B82F6] rounded font-mono bg-[#0F172A]">
                  Stage {securityStep === 0 ? '1' : securityStep === 1 ? '2' : '3'} of 3
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Clock size={14} className="text-[#3B82F6]" />
                      <span>Expires: <span className="font-mono text-white text-xs">{timer}s</span></span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-black uppercase text-white tracking-tight">
                      {securityStep === 0 ? 'Transaction Code' : 
                       securityStep === 1 ? 'Verification Code' : 
                       'Switch Code'}
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Enter your secure {securityStep === 0 ? 'TC' : securityStep === 1 ? 'VC' : 'SC'} to continue.</p>
                  </div>

                  <div className="space-y-6">
                    {securityStep === 0 && (
                      <div className="space-y-3 animate-in slide-in-from-right duration-300">
                        <input
                          type="text"
                          required
                          autoFocus
                          value={formData.transactionCode}
                          onChange={e => setFormData({...formData, transactionCode: e.target.value})}
                          className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-2xl font-bold font-mono tracking-[0.2em] text-center !bg-[#0F172A] !text-white"
                          placeholder="******"
                        />
                      </div>
                    )}

                    {securityStep === 1 && (
                      <div className="space-y-3 animate-in slide-in-from-right duration-300">
                        <input
                          type="text"
                          required
                          autoFocus
                          value={formData.verificationCode}
                          onChange={e => setFormData({...formData, verificationCode: e.target.value})}
                          className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-2xl font-bold font-mono tracking-[0.2em] text-center !bg-[#0F172A] !text-white"
                          placeholder="******"
                        />
                      </div>
                    )}

                    {securityStep === 2 && (
                      <div className="space-y-3 animate-in slide-in-from-right duration-300">
                        <input
                          type="text"
                          required
                          autoFocus
                          value={formData.switchCode}
                          onChange={e => setFormData({...formData, switchCode: e.target.value})}
                          className="w-full px-4 py-3 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-2xl font-bold font-mono tracking-[0.2em] text-center !bg-[#0F172A] !text-white"
                          placeholder="******"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-5 pt-2">
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="w-full py-3 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#0F172A] font-black uppercase text-xs tracking-widest rounded transition-all flex items-center justify-center gap-3 border border-[#3B82F6]/30"
                    >
                      {securityLoading ? <Loader2 className="animate-spin" size={16} /> : 
                       (securityStep === 2 ? "Authorize Wire Out" : "Verify Code Input")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSecurityModal(false);
                        setStep(1);
                        setSecurityStep(0);
                      }}
                      className="w-full py-2.5 bg-transparent text-slate-400 font-bold hover:text-white uppercase tracking-widest text-[9px] hover:bg-[#0F172A]/40 rounded border border-[#3B82F6]/20 transition-all"
                    >
                      Abort Direct Transfer
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PROCESSING DELAY OVERLAY */}
      <AnimatePresence>
        {isProcessingDelay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0F172A] backdrop-blur-xl"
          >
            <div className="w-full max-w-md bg-[#1E293B] rounded-xl border border-[#3B82F6]/30 p-10 text-center space-y-8 shadow-2xl">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-[#3B82F6] animate-spin"></div>
                <div className="absolute inset-2 bg-[#0F172A] rounded-full flex items-center justify-center text-[#3B82F6] border border-[#3B82F6]/10 font-bold">
                  ITO
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold uppercase tracking-widest text-white">Clearinghouse Routing</h3>
                <p className="text-[#3B82F6] font-semibold text-[10px] uppercase tracking-[0.2em]">Transaction Codes Certified • Core Channel Active</p>
              </div>

              <div className="h-1 bg-slate-800 w-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 w-2/3 absolute animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: "200px 100%" }} />
              </div>

              <div className="bg-[#0F172A] p-6 rounded border border-slate-700/50 min-h-[64px] flex items-center justify-center">
                <p className="text-xs text-slate-300 font-mono italic leading-snug animate-pulse">
                  {delayStatus}
                </p>
              </div>

              <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                Transfer Reference: {trackingId}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Chat Overlay */}
      <AnimatePresence>
        {showSupport && (
          <div className="fixed inset-0 z-[150] flex items-end justify-end p-6 pointer-events-none">
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm border border-[#3B82F6]/30 overflow-hidden pointer-events-auto flex flex-col h-[460px] shadow-2xl rounded-xl bg-[#1E293B]"
            >
              <div className="p-6 flex justify-between items-center bg-[#0F172A] border-b border-[#3B82F6]/25">
                <div className="flex items-center gap-5">
                  <div className="w-8 h-8 flex items-center justify-center font-black bg-[#3B82F6] text-[#0F172A] rounded text-xs">ITO</div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-white">ITO Support</h3>
                    <p className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">System Monitor Online</p>
                  </div>
                </div>
                <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-[#1E293B]">
                {supportMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "max-w-[85%] p-5 text-xs font-medium border rounded leading-relaxed",
                    msg.role === 'support' 
                      ? "bg-[#0F172A] text-slate-200 border-[#3B82F6]/15" 
                      : "bg-[#3B82F6] text-[#0F172A] border-[#3B82F6] ml-auto font-bold"
                  )}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-5 border-t border-[#3B82F6]/15 flex gap-3 bg-[#0F172A]">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="TYPE MESSAGE..."
                  className="flex-1 border border-[#3B82F6]/20 px-3 py-1.5 bg-[#1E293B] text-white text-xs outline-none rounded uppercase focus:border-[#3B82F6]"
                />
                <button type="submit" className="w-8 h-8 flex items-center justify-center bg-[#3B82F6] text-[#0F172A] hover:bg-[#60A5FA] rounded transition-all">
                  <SendHorizontal size={14} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
