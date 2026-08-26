import React, { useState, useEffect } from "react";
import { User } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Plus, UserX, UserCheck, Shield, MoreVertical, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingBalances, setEditingBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    balance: "",
    accountNumber: "",
    currency: "USD",
    tc: "",
    vc: "",
    sc: ""
  });

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        toast.success("User updated successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        const createdUser = await response.json();
        toast.success("User created successfully");
        toast.info(`Welcome email and account details sent to ${createdUser.username}@ito.com`, {
          duration: 6000,
        });
        setShowAddModal(false);
        fetchUsers();
        setNewUser({ username: "", password: "", name: "", balance: "", accountNumber: "", currency: "USD", tc: "", vc: "", sc: "" });
      }
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.accountNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 font-medium">Create, manage, and monitor system users.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#3B82F6] text-[#0F172A] rounded-md text-xs font-black uppercase tracking-wider hover:bg-[#60A5FA] transition-all border border-[#3B82F6]/30 shadow"
        >
          <Plus size={16} /> Create New User
        </button>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/25 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#3B82F6]/15 bg-[#0F172A]/40 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/30 rounded-md focus:border-[#3B82F6] focus:ring-0 outline-none text-xs font-medium !bg-[#0F172A] !text-white !border-[#3B82F6]/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A]/60 text-[#3B82F6] text-[9px] uppercase tracking-widest font-black border-b border-[#3B82F6]/15">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Account Details</th>
                <th className="px-6 py-4">Balance (Editable)</th>
                <th className="px-6 py-4">Security Codes</th>
                <th className="px-6 py-4">Live Monitor</th>
                <th className="px-6 py-4">Custom Error Message</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3B82F6]/10">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#0F172A]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 bg-[#0F172A] text-[#3B82F6] rounded-md flex items-center justify-center font-black border border-[#3B82F6]/30 shadow-inner">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#3B82F6] font-mono tracking-wider">{u.accountNumber}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{u.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const valStr = editingBalances[u.id] !== undefined ? editingBalances[u.id] : String(u.balance);
                        const val = parseFloat(valStr);
                        if (!isNaN(val)) {
                          updateUser(u.id, { balance: val });
                          const copy = { ...editingBalances };
                          delete copy[u.id];
                          setEditingBalances(copy);
                        }
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="flex items-center gap-1 bg-[#0F172A] border border-[#3B82F6]/35 rounded px-1.5 py-0.5 focus-within:border-[#3B82F6] transition-all">
                        <span className="text-[10px] font-black font-mono text-[#3B82F6]">{u.currency}</span>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editingBalances[u.id] !== undefined ? editingBalances[u.id] : u.balance}
                          onChange={(e) => {
                            setEditingBalances({
                              ...editingBalances,
                              [u.id]: e.target.value
                            });
                          }}
                          className="bg-white text-black text-xs font-black font-mono focus:ring-0 focus:outline-none w-18 px-1 py-0.5 rounded !bg-white !text-black border border-[#3B82F6]/30"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-[#3B82F6] text-[#0F172A] hover:bg-[#60A5FA] cursor-pointer transition-all rounded text-[9px] font-black uppercase tracking-wider border border-[#3B82F6]/30 shadow"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 font-mono text-[9px] text-slate-300">
                      <p><span className="font-bold text-[#3B82F6]">TC:</span> {u.tc}</p>
                      <p><span className="font-bold text-[#3B82F6]">VC:</span> {u.vc}</p>
                      <p><span className="font-bold text-[#3B82F6]">SC:</span> {u.sc}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">TC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentTC === u.tc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-slate-500 border-slate-700/50"
                        )}>
                          {u.currentTC || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">VC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentVC === u.vc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-slate-500 border-slate-700/50"
                        )}>
                          {u.currentVC || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentSC === u.sc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-slate-500 border-slate-700/50"
                        )}>
                          {u.currentSC || '---'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-3">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const msg = fd.get("message") as string;
                          updateUser(u.id, { customError: msg });
                        }}
                        className="flex gap-1 items-center"
                      >
                        <input 
                          type="text"
                          name="message"
                          placeholder="Type error/block alert..."
                          defaultValue={u.customError || ""}
                          className="text-[10px] px-2 py-1 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] w-40 outline-none transition-all !bg-[#0F172A] !text-white"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-[#3B82F6] text-[#0F172A] font-black uppercase text-[8px] tracking-wider rounded hover:bg-[#60A5FA] transition-all"
                        >
                          Submit
                        </button>
                      </form>
                      <div className="flex gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider border",
                          u.transfersEnabled ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" : "bg-amber-950/40 text-amber-400 border-amber-500/20"
                        )}>
                          T_Privilege: {u.transfersEnabled ? 'ON' : 'OFF'}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider border",
                          u.currencyApproved ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" : "bg-amber-950/40 text-amber-400 border-amber-500/20"
                        )}>
                          {u.currency}: {u.currencyApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateUser(u.id, { transfersEnabled: !u.transfersEnabled })}
                        className={cn(
                          "p-3 rounded border transition-all",
                          u.transfersEnabled 
                            ? "text-[#3B82F6] border-[#3B82F6]/30 bg-[#0F172A] hover:bg-[#3B82F6]/10" 
                            : "text-emerald-400 border-emerald-500/30 bg-[#0F172A] hover:bg-emerald-500/10"
                        )}
                        title={u.transfersEnabled ? "Restrict Transfers" : "Unrestrict Transfers"}
                      >
                        <Shield size={14} />
                      </button>
                      <button 
                        onClick={() => updateUser(u.id, { currencyApproved: !u.currencyApproved })}
                        className={cn(
                          "p-3 rounded border transition-all",
                          u.currencyApproved 
                            ? "text-[#3B82F6] border-[#3B82F6]/30 bg-[#0F172A] hover:bg-[#3B82F6]/10" 
                            : "text-emerald-400 border-emerald-500/30 bg-[#0F172A] hover:bg-emerald-500/10"
                        )}
                        title={u.currencyApproved ? "Revoke Currency Clearance" : "Grant Currency Clearance"}
                      >
                        <TrendingUp size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 flex items-center justify-center z-50 p-6 backdrop-blur-md">
          <div className="bg-[#1E293B] rounded-xl border border-[#3B82F6]/30 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#3B82F6]/20 flex items-center justify-between bg-[#0F172A]/40">
              <h3 className="text-base font-black text-[#3B82F6] uppercase tracking-widest">Create New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-[#3B82F6] transition-colors">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-[#1E293B]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-medium !bg-[#0F172A] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username / Email</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-medium !bg-[#0F172A] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-medium !bg-[#0F172A] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newUser.balance}
                    onChange={e => setNewUser({...newUser, balance: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-bold font-mono !bg-[#0F172A] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency Base</label>
                  <select
                    value={newUser.currency}
                    onChange={e => setNewUser({...newUser, currency: e.target.value as any})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none text-xs font-bold font-mono !bg-[#0F172A] !text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="PGK">PGK (K)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number</label>
                  <input
                    type="text"
                    required
                    value={newUser.accountNumber}
                    onChange={e => setNewUser({...newUser, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none font-mono text-xs font-bold !bg-[#0F172A] !text-white"
                    placeholder="ITO-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5 border-t border-[#3B82F6]/15 pt-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#3B82F6] uppercase tracking-wider">Transaction Code</label>
                  <input
                    type="text"
                    value={newUser.tc}
                    onChange={e => setNewUser({...newUser, tc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none font-mono text-xs !bg-[#0F172A] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#3B82F6] uppercase tracking-wider">Verification Code</label>
                  <input
                    type="text"
                    value={newUser.vc}
                    onChange={e => setNewUser({...newUser, vc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none font-mono text-xs !bg-[#0F172A] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#3B82F6] uppercase tracking-wider">Switch Code</label>
                  <input
                    type="text"
                    value={newUser.sc}
                    onChange={e => setNewUser({...newUser, sc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0F172A] text-white border border-[#3B82F6]/35 rounded focus:border-[#3B82F6] outline-none font-mono text-xs !bg-[#0F172A] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-5 border-t border-[#3B82F6]/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#3B82F6]/20 hover:bg-[#3B82F6]/10 text-slate-300 font-bold uppercase tracking-wider text-[10px] rounded transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#0F172A] font-black uppercase tracking-wider text-[10px] rounded hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
