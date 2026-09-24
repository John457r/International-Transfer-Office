import React, { useState, useEffect } from "react";
import { CardRequest } from "../types";
import { cn } from "../lib/utils";
import { Search, CheckCircle2, XCircle, Clock, MapPin, Phone, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "../lib/api";

export default function AdminCardRequests() {
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = () => {
    adminFetch("/api/admin/card-requests")
      .then(res => res.json())
      .then(data => setRequests(data));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await adminFetch(`/api/admin/card-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredRequests = requests.filter(r => 
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">ATM Card Requests</h1>
        <p className="text-xs text-[#8E9BAE] font-bold uppercase tracking-wider">Manage and process physical card delivery requests.</p>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1E2638] bg-[#0B0F17]/40 flex flex-col sm:flex-row gap-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
            <input
              type="text"
              placeholder="Search by user, name or address..."
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
                <th className="px-6 py-4">Card Details</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 rounded bg-[#0B0F17] text-[#F59E0B] flex items-center justify-center border border-[#1E2638]">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{r.userName}</p>
                        <p className="text-[9px] text-[#8E9BAE] font-bold uppercase">ID: {r.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase tracking-tight">{r.name}</p>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={12} className="text-[#F59E0B] mt-0.5" />
                        <span className="text-[10px] text-[#8E9BAE] font-bold uppercase max-w-[200px] leading-normal">{r.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#F59E0B]" />
                      <span className="text-xs font-mono font-bold text-white uppercase">{r.phone}</span>
                    </div>
                    <p className="text-[9px] text-[#8E9BAE] font-mono uppercase mt-1">{new Date(r.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.status === 'approved' ? <CheckCircle2 className="text-emerald-400" size={15} /> : 
                       r.status === 'rejected' ? <XCircle className="text-red-400" size={15} /> : 
                       <Clock className="text-amber-400" size={15} />}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest font-mono",
                        r.status === 'approved' ? "text-emerald-400" : 
                        r.status === 'rejected' ? "text-red-400" : "text-amber-400"
                      )}>
                        {r.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleStatusUpdate(r.id, 'approved')}
                          className="px-2 py-1 bg-[#0B0F17] border border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-950/20 text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider transition-all"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(r.id, 'rejected')}
                          className="px-2 py-1 bg-[#0B0F17] border border-red-505/20 hover:border-red-400 hover:bg-red-950/20 text-red-400 rounded text-[9px] font-black uppercase tracking-wider transition-all"
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
