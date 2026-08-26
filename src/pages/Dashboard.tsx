import { useState, useEffect } from "react";
import { User, Transfer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Wallet,
  Activity,
  MessageSquare,
  ShieldCheck,
  Zap,
  Lock
} from "lucide-react";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    fetch(`/api/transfers/${user.id}`)
      .then(res => res.json())
      .then(data => setTransfers(data));
  }, [user.id]);

  const recentTransfers = [...transfers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-200 text-xs">
      {/* Custom Error Alert */}
      {user.customError && (
        <div className="bg-red-950/40 border-l-4 border-red-500 p-5 rounded border border-red-900/30">
          <div className="flex items-center gap-3">
            <Lock className="text-red-400 shrink-0" size={15} />
            <p className="text-[10px] font-bold text-red-300 uppercase tracking-tight">
              {user.customError}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3B82F6]/10 pb-3">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Account / <span className="text-[#3B82F6]">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-[8px] font-bold uppercase tracking-widest text-[#3B82F6]/70 mt-0.5">
            Security Status: <span className="text-emerald-400 font-extrabold">Active Encryption Active</span>
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="px-3.5 py-1.5 bg-[#3B82F6] text-[#0F172A] font-black uppercase tracking-widest text-[8px] hover:bg-[#60A5FA] transition-all rounded"
          >
            Support Desktop
          </button>
        </div>
      </div>

      {/* Main Content Grid - High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1E293B] border border-[#3B82F6]/25 p-6 rounded-lg relative overflow-hidden group hover:border-[#3B82F6]/50 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 text-[#3B82F6] pointer-events-none">
              <Wallet size={80} />
            </div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] text-[#3B82F6] border border-[#3B82F6]/20 rounded">
                  <Wallet size={12} />
                </div>
                <h3 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Available Balance</h3>
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight font-mono">
                {formatCurrency(user.balance, user.currency)}
              </h2>
              
              <div className="grid grid-cols-2 gap-6 pt-3 border-t border-[#3B82F6]/15">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                  <p className="text-xs font-bold text-[#3B82F6] tracking-widest font-mono">{user.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Type</p>
                  <p className="text-xs font-bold text-slate-200 uppercase tracking-tight italic">Elite Savings Vault</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Mini List */}
          <div className="bg-[#1E293B] border border-[#3B82F6]/25 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-[#3B82F6]/15 flex items-center justify-between bg-[#0F172A]/40">
              <h3 className="text-[8px] font-bold uppercase tracking-widest text-[#3B82F6]">Recent Wire Directives</h3>
              <button onClick={() => window.location.href = '/transactions'} className="text-[8px] font-black text-[#3B82F6] uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="divide-y divide-[#3B82F6]/10">
              {recentTransfers.map((t) => (
                <div key={t.id} className="py-2.5 px-4 flex items-center justify-between hover:bg-[#0F172A]/20 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "w-7 h-7 flex items-center justify-center border rounded",
                      t.status === 'completed' 
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                        : "bg-amber-950/20 border-amber-500/30 text-amber-400"
                    )}>
                      {t.status === 'completed' ? <ArrowDownLeft size={13} /> : <Clock size={13} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">{t.bankName}</p>
                      <p className="text-[8px] font-medium text-slate-400 font-mono uppercase mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white mb-0.5">-{formatCurrency(t.amount, user.currency)}</p>
                    <p className={cn("text-[7px] font-black uppercase tracking-widest", t.status === 'completed' ? "text-emerald-400" : "text-amber-400")}>{t.status}</p>
                  </div>
                </div>
              ))}
              {recentTransfers.length === 0 && (
                <div className="p-6 text-center text-slate-500">
                  <p className="text-[8px] font-bold uppercase tracking-widest">No Recent Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ATM Card */}
        <div className="lg:col-span-12 xl:col-span-5 lg:col-start-8 lg:row-start-1 space-y-6">
          {/* Premium ATM Card - Smaller */}
          <div className="relative group max-w-sm mx-auto w-full">
            <div className="accent-gradient p-6 aspect-[1.65/1] flex flex-col justify-between relative overflow-hidden shadow-lg rounded-xl border border-[#3B82F6]/35 transition-all duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <ShieldCheck size={80} className="text-[#3B82F6]" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-7 bg-[#1E293B]/80 backdrop-blur-sm border border-[#3B82F6]/35 rounded-sm"></div>
                <div className="text-right">
                  <p className="font-extrabold italic text-xs tracking-tight leading-none text-white uppercase">ITO BANK</p>
                  <p className="text-[6px] font-bold tracking-widest text-slate-300 uppercase mt-0.5">Global Elite Card</p>
                </div>
              </div>
              
              <div className="relative z-10 my-1">
                <p className="text-sm font-mono font-bold tracking-[0.22em] text-[#3B82F6]">**** **** **** 4421</p>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[6px] font-bold uppercase text-slate-400 tracking-widest">Card Holder</p>
                  <p className="font-bold tracking-widest uppercase text-[10px] text-white leading-none">{user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[6px] font-bold uppercase text-slate-400 tracking-widest">Expires</p>
                  <p className="text-[10px] font-bold text-white font-mono leading-none">12/28</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-[#3B82F6]/25 p-6 space-y-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-[#0F172A] text-[#3B82F6] border border-[#3B82F6]/20 rounded">
                <Lock size={12} />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-[#3B82F6]">Security Status</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">Active Protection</p>
              </div>
            </div>
            <p className="text-[8px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">
              Secured with multi-factor quantum-layered TLS and continuous hardware security modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
