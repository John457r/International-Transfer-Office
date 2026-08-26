import { User } from "../types";
import { formatCurrency } from "../lib/utils";
import { User as UserIcon, Mail, Phone, MapPin, Shield, CreditCard } from "lucide-react";

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-200">
      <div className="bg-[#1E293B] rounded-xl p-8 text-white relative overflow-hidden shadow-2xl border border-[#3B82F6]/25">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <UserIcon size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-[#0F172A] rounded text-[#3B82F6] border-2 border-[#3B82F6]/30 flex items-center justify-center text-3xl font-black shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-[#3B82F6]" /> {user.username}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-[#3B82F6]" /> {user.phone || "+1 (555) 012-3456"}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#3B82F6]" /> {user.country || "United Kingdom"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/25 p-6 space-y-6 shadow-2xl">
          <h3 className="font-extrabold text-[#3B82F6] flex items-center gap-3 uppercase tracking-tight text-xs">
            <CreditCard className="text-[#3B82F6]" size={16} /> Account Dossier
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between py-2.5 border-b border-[#3B82F6]/15">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Account Identifier</span>
              <span className="font-mono font-bold text-white text-xs">{user.accountNumber}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#3B82F6]/15">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Dossier Classification</span>
              <span className="font-bold text-[#3B82F6] uppercase text-xs">Elite International Savings</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#3B82F6]/15">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Base Ledger Currency</span>
              <span className="font-bold text-white uppercase text-xs">{user.currency || 'USD'}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#3B82F6]/15">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Financial Liquidity</span>
              <span className="font-extrabold text-[#3B82F6] font-mono text-xs">{formatCurrency(user.balance, user.currency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Authority Clearance Since</span>
              <span className="font-bold text-white uppercase text-xs">March 2024</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/25 p-6 space-y-6 shadow-2xl">
          <h3 className="font-extrabold text-[#3B82F6] flex items-center gap-3 uppercase tracking-tight text-xs">
            <Shield className="text-[#3B82F6]" size={16} /> Encryption & Cyber Security
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5.5 bg-[#0F172A]/60 border border-[#3B82F6]/15 rounded">
              <div>
                <p className="text-xs font-bold text-white uppercase">Multi-Factor Hardware Key</p>
                <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Enabled via encrypted TLS</p>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded relative border border-[#3B82F6]/20">
                <div className="absolute right-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded border border-[#3B82F6]/20"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5.5 bg-[#0F172A]/60 border border-[#3B82F6]/15 rounded">
              <div>
                <p className="text-xs font-bold text-white uppercase">Outbound Wire Validation</p>
                <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Validation protocol active</p>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded relative border border-[#3B82F6]/20">
                <div className="absolute right-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded border border-[#3B82F6]/20"></div>
              </div>
            </div>

            <div className="p-5 bg-[#0F172A]/40 rounded border border-[#3B82F6]/15 text-[9px] text-slate-400 leading-normal uppercase font-mono">
              IP ADDRESS PROTOCOL LOGGED: ACTIVE DIRECT SECURE CLIENT NODE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
