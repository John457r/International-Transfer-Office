import { useState, useEffect } from "react";
import { Transfer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Filter, Clock, CheckCircle2, MoreVertical, Check, X } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "../lib/api";

export default function AdminTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransfers = () => {
    adminFetch("/api/admin/transfers")
      .then(res => res.json())
      .then(data => setTransfers(data));
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await adminFetch(`/api/admin/transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Transfer marked as ${status}`);
        fetchTransfers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const filteredTransfers = transfers.filter(t => 
    t.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Transfers</h1>
        <p className="text-xs text-[#8E9BAE]">Monitor all international wires across the platform.</p>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1E2638] bg-[#0B0F17]/40 flex flex-col sm:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
            <input
              type="text"
              placeholder="Search by bank, name or user..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-black text-xs font-black placeholder:text-[#8E9BAE] border border-[#1E2638] rounded outline-none focus:border-[#F59E0B]"
            />
          </div>
          <button className="inline-flex items-center gap-3 px-4 py-2 bg-[#0B0F17] border border-[#1E2638] rounded text-xs font-black text-slate-200 hover:text-white hover:border-[#F59E0B] uppercase tracking-widest transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F17]/60 text-[#F59E0B] text-[9px] uppercase tracking-widest font-black border-b border-[#1E2638]">
                <th className="px-6 py-4">Sender Details</th>
                <th className="px-6 py-4">Recipient Destination</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-white tracking-tight uppercase">{t.userName}</p>
                    <p className="text-[9px] text-[#8E9BAE] font-bold font-mono">UID: {t.userId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-white tracking-tight uppercase">{t.bankName}</p>
                    <p className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-wider">{t.accountName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#F59E0B] font-mono">{formatCurrency(t.amount)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#8E9BAE] font-mono font-medium">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-[#8E9BAE] font-mono">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {t.status === 'completed' ? <CheckCircle2 className="text-emerald-400" size={14} /> : (t.status === 'failed' ? <X className="text-red-400" size={14} /> : <Clock className="text-amber-400" size={14} />)}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest font-mono",
                        t.status === 'completed' ? "text-emerald-400" : (t.status === 'failed' ? "text-red-400" : "text-amber-400")
                      )}>
                        {t.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {t.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(t.id, 'completed')} className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors" title="Mark Completed">
                          <Check size={14} />
                        </button>
                        <button onClick={() => updateStatus(t.id, 'failed')} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors" title="Decline">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className="p-3 text-[#8E9BAE] hover:text-white rounded transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    )}
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
