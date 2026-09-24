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
  Lock,
  ShieldAlert
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-200 text-xs relative z-10">
      {/* Persistent Terminal Verification Security Alert Banner */}
      {!user.isTerminalVerified && (
        <div 
          id="terminal-security-alert-banner"
          className="bg-amber-950/90 backdrop-blur-md border-2 border-amber-500 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.25)] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded bg-amber-500 text-[#0B0F17] flex items-center justify-center shrink-0 font-black shadow-md">
              <ShieldAlert size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-tight">
                SECURITY ALERT: Unverified Terminal. Outbound transfers are currently restricted.
              </p>
              <p className="text-[10px] text-amber-200/80 font-medium mt-0.5">
                Terminal verification required for all outbound international wire transfers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={13} />
              Live Chat Support
            </button>
            <a
              href="/transfer"
              className="px-4 py-2 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] font-black text-[9px] uppercase tracking-widest rounded transition-all shadow-md flex items-center gap-1.5"
            >
              Verify Terminal
            </a>
          </div>
        </div>
      )}

      {/* Custom Error Alert */}
      {user.customError && (
        <div className="bg-red-950/40 backdrop-blur-md border-l-4 border-red-500 p-5 rounded border border-red-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-3">
            <Lock className="text-red-400 shrink-0" size={15} />
            <p className="text-[10px] font-bold text-red-300 uppercase tracking-tight">
              {user.customError}
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="shrink-0 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded text-[9px] font-black uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            Contact Support Team
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_5px_rgba(245,158,11,0.2)]">
            Account / <span className="text-[#F59E0B] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-[8px] font-bold uppercase tracking-widest text-[#F59E0B]/70 mt-1">
            Security Status: <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">Active Encryption Active</span>
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="px-4 py-2 bg-[#F59E0B] text-[#0B0F17] font-black uppercase tracking-widest text-[9px] hover:bg-[#FF9500] hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all rounded shadow-lg"
          >
            Support Desktop
          </button>
        </div>
      </div>

      {/* Main Content Grid - High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Account Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121824]/60 backdrop-blur-xl border border-amber-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-500 flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 text-amber-500 pointer-events-none">
              <Wallet size={100} />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#0B0F17]/80 text-[#F59E0B] border border-amber-500/30 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Wallet size={14} />
                </div>
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#8E9BAE]">Available Balance</h3>
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tight font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                {formatCurrency(user.balance, user.currency)}
              </h2>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-amber-500/10">
                <div>
                  <p className="text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-xs font-bold text-[#F59E0B] tracking-widest font-mono drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">{user.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest mb-1">Account Type</p>
                  <p className="text-xs font-bold text-slate-200 uppercase tracking-tight italic">Elite Savings Vault</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Mini List */}
          <div className="bg-[#121824]/60 backdrop-blur-xl border border-amber-500/20 rounded-xl overflow-hidden hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-500">
            <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-[#0B0F17]/40 shadow-inner">
              <h3 className="text-[8px] font-bold uppercase tracking-widest text-[#F59E0B] drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">Recent Wire Directives</h3>
              <button onClick={() => window.location.href = '/transactions'} className="text-[8px] font-black text-[#F59E0B] uppercase tracking-widest hover:text-[#FF9500] hover:drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] transition-all">View All</button>
            </div>
            <div className="divide-y divide-amber-500/10">
              {recentTransfers.map((t) => (
                <div key={t.id} className="py-3 px-5 flex items-center justify-between hover:bg-[#0B0F17]/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center border rounded shadow-inner",
                      t.status === 'completed' 
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                        : "bg-amber-950/40 border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                    )}>
                      {t.status === 'completed' ? <ArrowDownLeft size={14} /> : <Clock size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">{t.bankName}</p>
                      <p className="text-[8px] font-medium text-[#8E9BAE] font-mono uppercase mt-1">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white mb-0.5">-{formatCurrency(t.amount, user.currency)}</p>
                    <p className={cn("text-[8px] font-black uppercase tracking-widest", t.status === 'completed' ? "text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" : "text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]")}>{t.status}</p>
                  </div>
                </div>
              ))}
              {recentTransfers.length === 0 && (
                <div className="p-6 text-center text-[#8E9BAE]">
                  <p className="text-[8px] font-bold uppercase tracking-widest">No Recent Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ATM Card & Security Status */}
        <div className="lg:col-span-12 xl:col-span-5 lg:col-start-8 lg:row-start-1 space-y-6">
          {/* Premium ATM Card - Smaller */}
          <div className="relative group max-w-sm mx-auto w-full">
            <div className="bg-gradient-to-br from-[#121824] to-[#0B0F17] p-6 aspect-[1.65/1] flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)] rounded-xl border border-amber-500/30 group-hover:border-amber-500/60 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.25)] transition-all duration-500">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjQ1LCAxNTgsIDExLCAwLjE1KSIvPjwvc3ZnPg==')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <ShieldCheck size={100} className="text-[#F59E0B]" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-7 bg-[#F59E0B]/20 backdrop-blur-md border border-amber-500/40 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.2)]"></div>
                <div className="text-right">
                  <p className="font-extrabold italic text-xs tracking-tight leading-none text-white uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">INTERNET SUPPORT TEAM</p>
                  <p className="text-[7px] font-bold tracking-widest text-[#F59E0B] uppercase mt-1">Global Elite Card</p>
                </div>
              </div>
              
              <div className="relative z-10 my-1">
                <p className="text-sm font-mono font-bold tracking-[0.22em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">**** **** **** 4421</p>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[7px] font-bold uppercase text-[#8E9BAE] tracking-widest">Card Holder</p>
                  <p className="font-bold tracking-widest uppercase text-[10px] text-white leading-none drop-shadow-[0_0_3px_rgba(255,255,255,0.2)] mt-0.5">{user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-bold uppercase text-[#8E9BAE] tracking-widest">Expires</p>
                  <p className="text-[10px] font-bold text-white font-mono leading-none drop-shadow-[0_0_3px_rgba(255,255,255,0.2)] mt-0.5">12/28</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121824]/60 backdrop-blur-xl border border-amber-500/20 p-6 space-y-4 rounded-xl hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-[#0B0F17]/80 text-[#F59E0B] border border-amber-500/30 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Lock size={14} />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-[#F59E0B]">Security Status</p>
                <p className="text-xs font-bold text-white uppercase tracking-tight leading-none mt-1">Active Protection</p>
              </div>
            </div>
            <p className="text-[9px] font-medium text-[#8E9BAE] leading-relaxed uppercase tracking-widest">
              Secured with multi-factor quantum-layered TLS and continuous hardware security modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
