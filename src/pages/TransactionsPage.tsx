import { useState, useEffect } from "react";
import { User, Transfer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Filter, Download, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TransactionsPageProps {
  user: User;
}

export default function TransactionsPage({ user }: TransactionsPageProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`/api/transfers/${user.id}`)
      .then(res => res.json())
      .then(data => setTransfers(data));
  }, [user.id]);

  const filteredTransfers = transfers.filter(t => 
    t.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountNumber.includes(searchTerm)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportCSV = () => {
    if (transfers.length === 0) {
      toast.error("No transaction records available to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Bank Name",
      "Account Name",
      "Account Number",
      "Swift Code",
      "Routing Number",
      "Amount",
      "Currency",
      "Status",
      "Date",
      "Description"
    ];

    const rows = filteredTransfers.map(t => [
      `"${t.id}"`,
      `"${t.bankName.replace(/"/g, '""')}"`,
      `"${t.accountName.replace(/"/g, '""')}"`,
      `"${t.accountNumber}"`,
      `"${t.swiftCode || ''}"`,
      `"${t.routingNumber || ''}"`,
      t.amount,
      `"${user.currency}"`,
      `"${t.status}"`,
      `"${new Date(t.date).toISOString()}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ITO_Transactions_${user.accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction history exported successfully");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-400" size={15} />;
      case 'pending': return <Clock className="text-amber-400" size={15} />;
      case 'failed': return <XCircle className="text-red-400" size={15} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Transaction History</h1>
          <p className="text-[#8E9BAE] text-xs">View and manage all your past transfers.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] cursor-pointer rounded text-xs font-black uppercase tracking-wider transition-all shadow border border-[#1E2638] active:scale-95"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1E2638] bg-[#0B0F17]/40 flex flex-col sm:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
            <input
              type="text"
              placeholder="Search by bank, name or account..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0B0F17]/80 text-white text-xs font-semibold placeholder:text-[#8E9BAE] border border-[#1E2638] rounded outline-none focus:border-[#F59E0B] transition-colors"
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
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Cleared Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-5">
                        <div className="w-8 h-8 rounded bg-[#0B0F17] text-[#F59E0B] flex items-center justify-center border border-[#1E2638]">
                          <ArrowUpRight size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{t.bankName}</p>
                          <p className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-wider">Wire Remittance</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-200 uppercase">{t.accountName}</p>
                      <p className="text-[10px] text-[#8E9BAE] font-mono tracking-widest">{t.accountNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-[#8E9BAE] font-mono font-medium">{new Date(t.date).toLocaleDateString()}</p>
                      <p className="text-[9px] text-[#8E9BAE] font-mono">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-white font-mono">-{formatCurrency(t.amount, user.currency)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(t.status)}
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest font-mono",
                          t.status === 'completed' ? "text-emerald-400" : 
                          t.status === 'pending' ? "text-amber-400" : "text-red-400"
                        )}>
                          {t.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8E9BAE] font-bold uppercase tracking-widest text-[10px]">
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
