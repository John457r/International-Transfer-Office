import React from "react";
import { ShieldAlert, MessageCircle, Clock, CheckCircle, HelpCircle, Lock } from "lucide-react";

interface ComplianceHoldPageProps {
  onLogout: () => void;
  user: any;
}

export default function ComplianceHoldPage({ onLogout, user }: ComplianceHoldPageProps) {
  
  const handleOpenSupport = () => {
    // Open the floating support desk chat
    window.dispatchEvent(new CustomEvent('open-support-chat'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      {/* Background vector visual */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl bg-[#1E293B] rounded-xl border-2 border-red-500/20 shadow-2xl p-8 sm:p-12 relative z-10 text-center">
        {/* Alerts / Icon badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-950/40 text-red-500 rounded-full mb-6 border border-red-500/30 animate-pulse">
          <ShieldAlert size={40} />
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">Compliance Hold</h2>
        <p className="text-[#3B82F6] font-bold uppercase tracking-[0.2em] text-xs mt-2">
          Jurisdictional Anti-Fraud Clearance & Verification File Required
        </p>

        {user.customError && (
          <div className="max-w-md mx-auto bg-red-950/50 border border-red-500/30 p-5.5 rounded text-left mt-4 text-xs font-semibold text-red-300 flex items-start gap-3.5 animate-bounce">
            <Lock className="text-red-400 shrink-0 mt-0.5" size={14} />
            <div>
              <p className="font-extrabold uppercase text-[8px] tracking-wider text-red-400 mb-0.5">ADMIN SECURE WARNING DIRECTIVE:</p>
              <p className="leading-normal font-mono uppercase text-[10px]">{user.customError}</p>
            </div>
          </div>
        )}

        <div className="h-0.5 w-24 bg-red-500/30 mx-auto mt-6"></div>

        {/* Informative Grid */}
        <div className="bg-[#0F172A]/60 rounded-lg p-6 my-8 text-left border border-[#3B82F6]/20 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-3">
            <Clock size={16} className="text-red-400" /> Account Status Detail
          </h3>
          
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Your registration application was successfully received under account identifier <span className="font-mono text-[#3B82F6] font-bold">{user.accountNumber}</span>. However, to maintain alignment with cross-border banking guidelines (including the Bank of Papua New Guinea compliance channels, the Bank of England clearing regulations, and US federal AML standards), all newly self-registered digital bank portals are placed on <span className="text-red-400 font-bold">Compliance Hold</span>.
            </p>
            <p>
              Your account portfolio is currently marked as <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 font-bold rounded uppercase">Pending Admin Review</span>. You currently have <span className="text-red-400 font-bold">restricted access</span> to outbound remittances, digital card issuance, and fund authorization pipelines until identity verifications are certified manually.
            </p>
          </div>

          <div className="pt-4 border-t border-[#3B82F6]/15 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-[#1E293B]/40 p-5 rounded border border-[#3B82F6]/15">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">KYC Pipeline</span>
              <span className="text-amber-500 text-xs font-bold uppercase mt-1 block">In Progress</span>
            </div>
            <div className="bg-[#1E293B]/40 p-5 rounded border border-[#3B82F6]/15">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Currency</span>
              <span className="text-[#3B82F6] text-xs font-bold uppercase mt-1 block">{user.currency || 'USD'}</span>
            </div>
            <div className="bg-[#1E293B]/40 p-5 rounded border border-[#3B82F6]/15">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Jurisdictions</span>
              <span className="text-slate-200 text-xs font-bold uppercase mt-1 block">{user.country || 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* Steps/Directives to activate */}
        <div className="space-y-6">
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Please initiate an online secure chat session to connect directly with an active security examiner. Provide your Reference ID to request manual activation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
               onClick={handleOpenSupport}
              className="w-full sm:w-auto px-6 py-3 bg-[#3B82F6] text-[#0F172A] font-bold text-xs uppercase tracking-widest hover:bg-[#60A5FA] transition-all flex items-center justify-center gap-3 shadow-lg border border-[#3B82F6]/30"
            >
              <MessageCircle size={16} />
              Open Live Support Desk
            </button>

            <button
              onClick={onLogout}
              className="w-full sm:w-auto px-6 py-3 border border-[#3B82F6]/30 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-[#1E293B] transition-all flex items-center justify-center gap-3"
            >
              <Lock size={16} />
              Secure Log Out
            </button>
          </div>
        </div>

        {/* Footnotes */}
        <div className="mt-8 text-[9px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <ShieldAlert size={12} className="text-[#3B82F6]" /> Continuous 256-bit monitoring active on user portal
        </div>
      </div>
    </div>
  );
}
