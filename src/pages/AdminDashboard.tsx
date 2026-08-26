import { useState, useEffect } from "react";
import { formatCurrency, cn } from "../lib/utils";
import { 
  Users, 
  ArrowUpRight, 
  CreditCard, 
  Activity,
  Clock,
  Shield,
  Lock,
  Key,
  ShieldCheck,
  Hash,
  Power,
  Loader2
} from "lucide-react";
import { SecuritySettings } from "../types";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransfers: 0,
    pendingCollections: 0,
    totalVolume: 0
  });

  const [settings, setSettings] = useState<SecuritySettings>({
    requireTransactionCode: true,
    requireVerificationCode: true,
    requireSwitchCode: true,
    transfersEnabled: true
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data));

    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data));

    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleToggle = async (key: keyof SecuritySettings) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(newSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-400 font-medium">Global System Control & Security Management</p>
        </div>
        <div className="flex items-center gap-5 px-4 py-2 bg-[#1E293B] border border-[#3B82F6]/30 rounded-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-[#3B82F6]', bg: 'bg-[#0F172A]' },
          { label: 'Active Transfers', value: stats.totalTransfers, icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-[#0F172A]' },
          { label: 'Pending Requests', value: stats.pendingCollections, icon: Clock, color: 'text-amber-400', bg: 'bg-[#0F172A]' },
          { label: 'System Health', value: '99.9%', icon: Shield, color: 'text-slate-300', bg: 'bg-[#0F172A]' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#1E293B] border border-[#3B82F6]/20 rounded-lg hover:border-[#3B82F6]/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-md border border-[#3B82F6]/25", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-[#1E293B] border border-[#3B82F6]/25 rounded-lg">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-3 bg-[#0F172A] border border-[#3B82F6]/20 rounded-md text-[#3B82F6]">
              <Lock size={20} />
            </div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">Security Protocols</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { id: 'requireTransactionCode', label: 'Transaction Code (TC)', desc: 'Mandatory for all outbound transfers', icon: Key },
              { id: 'requireVerificationCode', label: 'Verification Code (VC)', desc: 'Secondary approval for high-value transactions', icon: ShieldCheck },
              { id: 'requireSwitchCode', label: 'Switch Code (SC)', desc: 'Final clearance for international routing', icon: Hash },
              { id: 'transfersEnabled', label: 'Global Transfer Switch', desc: 'Enable or disable all system transfers', icon: Power },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-6 bg-[#0F172A]/50 border border-[#3B82F6]/15 rounded-lg">
                <div className="flex gap-5">
                  <div className="mt-1 text-slate-400">
                    <setting.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">{setting.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{setting.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setting.id as keyof SecuritySettings)}
                  disabled={loading}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative border border-[#3B82F6]/20",
                    settings[setting.id as keyof SecuritySettings] ? "bg-[#3B82F6]" : "bg-[#0F172A]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full transition-all border shadow",
                    settings[setting.id as keyof SecuritySettings] 
                      ? "left-7 bg-[#0F172A] border-[#3B82F6]/30" 
                      : "left-1 bg-[#1E293B] border-[#3B82F6]/15"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#1E293B] border border-[#3B82F6]/25 rounded-lg">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-3 bg-[#0F172A] border border-[#3B82F6]/20 rounded-md text-[#3B82F6]">
              <Activity size={20} />
            </div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">System Activity</h2>
          </div>

          <div className="space-y-3">
            {[
              { type: 'security', msg: 'Global TC Protocol updated', time: '2 mins ago' },
              { type: 'user', msg: 'New account ITO-8829-1022 created', time: '15 mins ago' },
              { type: 'transfer', msg: 'High-value transfer flagged for VC', time: '45 mins ago' },
              { type: 'system', msg: 'Database backup completed', time: '2 hours ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#0F172A]/50 border border-[#3B82F6]/15 rounded-lg text-slate-200">
                <div className="flex items-center gap-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]/60" />
                  <p className="text-xs font-medium text-slate-300">{log.msg}</p>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{log.time}</span>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 border border-[#3B82F6]/30 bg-[#0F172A]/40 text-[#3B82F6] font-bold uppercase tracking-widest text-[9px] hover:bg-[#3B82F6]/10 transition-all rounded">
            View Full Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
