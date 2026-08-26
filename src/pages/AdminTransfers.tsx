import { useState, useEffect } from "react";
import { Transfer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Filter, Clock, CheckCircle2, MoreVertical } from "lucide-react";

export default function AdminTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/transfers")
      .then(res => res.json())
      .then(data => setTransfers(data));
  }, []);

  const filteredTransfers = transfers.filter(t => 
    t.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Transfers</h1>
        <p className="text-xs text-slate-400">Monitor all international wires across the platform.</p>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/25 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#3B82F6]/15 bg-[#0F172A]/40 flex flex-col sm:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by bank, name or user..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-black text-xs font-black placeholder:text-slate-505 border border-[#3B82F6]/30 rounded outline-none focus:border-[#3B82F6]"
            />
          </div>
          <button className="inline-flex items-center gap-3 px-4 py-2 bg-[#0F172A] border border-[#3B82F6]/35 rounded text-xs font-black text-slate-200 hover:text-white hover:border-[#3B82F6] uppercase tracking-widest transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A]/60 text-[#3B82F6] text-[9px] uppercase tracking-widest font-black border-b border-[#3B82F6]/15">
                <th className="px-6 py-4">Sender Details</th>
                <th className="px-6 py-4">Recipient Destination</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3B82F6]/10">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#0F172A]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-white tracking-tight uppercase">{t.userName}</p>
                    <p className="text-[9px] text-slate-400 font-bold font-mono">UID: {t.userId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-white tracking-tight uppercase">{t.bankName}</p>
                    <p className="text-[9px] text-[#3B82F6] font-bold uppercase tracking-wider">{t.accountName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#3B82F6] font-mono">{formatCurrency(t.amount)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-300 font-mono font-medium">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-450 font-mono">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {t.status === 'completed' ? <CheckCircle2 className="text-emerald-400" size={14} /> : <Clock className="text-amber-400" size={14} />}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest font-mono",
                        t.status === 'completed' ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {t.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-3 text-slate-400 hover:text-white rounded transition-colors">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
