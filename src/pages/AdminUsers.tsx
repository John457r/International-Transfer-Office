import React, { useState, useEffect } from "react";
import { User } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Plus, UserX, UserCheck, Shield, MoreVertical, Loader2, TrendingUp, Copy, Check, KeyRound, ShieldAlert, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingBalances, setEditingBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    balance: "",
    accountNumber: "",
    currency: "USD",
    tc: "",
    vc: "",
    sc: "",
    activationPin: ""
  });

  const fetchUsers = () => {
    adminFetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => {});
  };

  const copyPinToClipboard = (pin: string, userId: string, name: string) => {
    if (!pin) {
      toast.error("No Activation PIN available for this user");
      return;
    }
    navigator.clipboard.writeText(pin);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2500);
    toast.success(`Copied Activation PIN (${pin}) for ${name} to clipboard!`);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await adminFetch(`/api/admin/users/${id}`, {
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
      const response = await adminFetch("/api/admin/users", {
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
        setNewUser({ username: "", password: "", name: "", balance: "", accountNumber: "", currency: "USD", tc: "", vc: "", sc: "", activationPin: "" });
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
      const response = await adminFetch(`/api/admin/users/${id}`, {
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

  const isUserPending = (u: User) => {
    return u.role !== 'admin' && Boolean(
      u.isBlocked || 
      u.status === 'Pending Support Review' || 
      u.status === 'Pending Admin Review' || 
      u.status === 'HOLD'
    );
  };

  const pendingCount = users.filter(isUserPending).length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.accountNumber.includes(searchTerm);
    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return isUserPending(u);
    if (statusFilter === 'active') return !isUserPending(u) && u.role !== 'admin';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">User Management & Activation</h1>
          <p className="text-xs text-[#8E9BAE] font-medium">Review pending user registrations, activate terminals, and manage accounts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#F59E0B] text-[#0B0F17] rounded-md text-xs font-black uppercase tracking-wider hover:bg-[#FF9500] transition-all border border-[#1E2638] shadow cursor-pointer"
        >
          <Plus size={16} /> Create New User
        </button>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-[#1E2638] bg-[#0B0F17]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9BAE]" size={16} />
            <input
              type="text"
              placeholder="Search users by name, username, account..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded-md focus:border-[#F59E0B] focus:ring-0 outline-none text-xs font-medium !bg-[#0B0F17] !text-white !border-[#1E2638]"
            />
          </div>

          {/* Quick Filter Tabs for Support Team */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                statusFilter === 'all'
                  ? "bg-[#1E2638] text-white border-slate-600"
                  : "bg-[#0B0F17] text-[#8E9BAE] border-[#1E2638] hover:text-white"
              )}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                statusFilter === 'pending'
                  ? "bg-amber-950/70 text-amber-300 border-amber-500/50 shadow"
                  : "bg-[#0B0F17] text-amber-400/80 border-amber-500/30 hover:text-amber-300"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Pending Support Activation ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                statusFilter === 'active'
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50"
                  : "bg-[#0B0F17] text-slate-400 border-[#1E2638] hover:text-white"
              )}
            >
              Active & Approved
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0F17]/60 text-[#F59E0B] text-[9px] uppercase tracking-widest font-black border-b border-[#1E2638]">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Account Details</th>
                <th className="px-6 py-4">Balance (Editable)</th>
                <th className="px-6 py-4">Security Codes</th>
                <th className="px-6 py-4">Terminal PIN (KYC)</th>
                <th className="px-6 py-4">Live Monitor</th>
                <th className="px-6 py-4">Custom Error Message</th>
                <th className="px-6 py-4">Support Team Activation & Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5">
                      <div className="w-8 h-8 bg-[#0B0F17] text-[#F59E0B] rounded-md flex items-center justify-center font-black border border-[#1E2638] shadow-inner">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{u.name}</p>
                        <p className="text-[10px] text-[#8E9BAE] font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#F59E0B] font-mono tracking-wider">{u.accountNumber}</p>
                    <p className="text-[9px] text-[#8E9BAE] font-black uppercase tracking-widest mt-0.5">{u.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const valStr = editingBalances[u.id] !== undefined ? editingBalances[u.id] : String(u.balance);
                        const val = parseFloat(valStr);
                        if (!isNaN(val)) {
                          updateUser(u.id, { balance: val, status: "APPROVED", isBlocked: false });
                          const copy = { ...editingBalances };
                          delete copy[u.id];
                          setEditingBalances(copy);
                        }
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#1E2638] rounded px-1.5 py-0.5 focus-within:border-[#F59E0B] transition-all">
                        <span className="text-[10px] font-black font-mono text-[#F59E0B]">{u.currency}</span>
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
                          className="bg-white text-black text-xs font-black font-mono focus:ring-0 focus:outline-none w-18 px-1 py-0.5 rounded !bg-white !text-black border border-[#1E2638]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] cursor-pointer transition-all rounded text-[9px] font-black uppercase tracking-wider border border-[#1E2638] shadow"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 font-mono text-[9px] text-[#8E9BAE]">
                      <p><span className="font-bold text-[#F59E0B]">TC:</span> {u.tc}</p>
                      <p><span className="font-bold text-[#F59E0B]">VC:</span> {u.vc}</p>
                      <p><span className="font-bold text-[#F59E0B]">SC:</span> {u.sc}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#F59E0B] tracking-widest bg-[#0B0F17] px-2.5 py-1 rounded border border-amber-500/40 shadow-inner select-all">
                          {u.activationPin || "------"}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPinToClipboard(u.activationPin || "", u.id, u.name)}
                          title="Copy Activation PIN to send via Live Chat"
                          className="p-1.5 bg-[#0B0F17] hover:bg-[#F59E0B] hover:text-[#0B0F17] text-slate-300 rounded transition-all cursor-pointer border border-[#1E2638] active:scale-95 flex items-center justify-center shadow"
                        >
                          {copiedId === u.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1",
                          u.isTerminalVerified 
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" 
                            : "bg-amber-950/40 text-amber-400 border-amber-500/30"
                        )}>
                          {u.isTerminalVerified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                          {u.isTerminalVerified ? "Verified" : "Unverified"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateUser(u.id, { isTerminalVerified: !u.isTerminalVerified });
                            toast.success(`Terminal status updated to ${!u.isTerminalVerified ? 'Verified' : 'Unverified'}`);
                          }}
                          className="text-[8px] text-[#8E9BAE] hover:text-white underline cursor-pointer"
                          title="Toggle terminal verification status"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#8E9BAE] uppercase tracking-widest">TC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentTC === u.tc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-[#8E9BAE] border-slate-700/50"
                        )}>
                          {u.currentTC || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#8E9BAE] uppercase tracking-widest">VC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentVC === u.vc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-[#8E9BAE] border-slate-700/50"
                        )}>
                          {u.currentVC || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[#8E9BAE] uppercase tracking-widest">SC</span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm",
                          u.currentSC === u.sc ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/30" : "text-[#8E9BAE] border-slate-700/50"
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
                          className="text-[10px] px-2 py-1 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] w-40 outline-none transition-all !bg-[#0B0F17] !text-white"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-[#F59E0B] text-[#0B0F17] font-black uppercase text-[8px] tracking-wider rounded hover:bg-[#FF9500] transition-all"
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
                    {u.role === 'admin' ? (
                      <span className="text-[9px] font-mono text-[#8E9BAE] uppercase">System Admin</span>
                    ) : (
                      <div className="flex flex-col gap-2 min-w-[210px]">
                        <div className="flex items-center gap-2">
                          {(u.isBlocked || u.status === 'Pending Support Review' || u.status === 'Pending Admin Review' || u.status === 'HOLD') ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              Pending Support Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                              <Check size={10} />
                              Active & Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(u.isBlocked || u.status === 'Pending Support Review' || u.status === 'Pending Admin Review' || u.status === 'HOLD') ? (
                            <button 
                              onClick={() => {
                                updateUser(u.id, { isBlocked: false, status: "APPROVED", isTerminalVerified: true });
                                toast.success(`Support Team: Activated & unlocked ${u.name}!`);
                              }}
                              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-[9px] flex items-center gap-1.5 shadow transition-all cursor-pointer whitespace-nowrap active:scale-95"
                              title="Support Team: Review & Activate Account"
                            >
                              <CheckCircle size={13} />
                              Support Team: Activate User
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                updateUser(u.id, { isBlocked: true, status: "Pending Support Review" });
                                toast.info(`Support Team: Account for ${u.name} placed on hold.`);
                              }}
                              className="px-2.5 py-1 rounded border border-[#1E2638] bg-[#0B0F17] hover:bg-red-950/40 text-slate-300 hover:text-red-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                              title="Support Team: Place on hold"
                            >
                              <Shield size={12} />
                              Support: Hold
                            </button>
                          )}

                          <button 
                            onClick={() => updateUser(u.id, { currencyApproved: !u.currencyApproved })}
                            className={cn(
                              "px-2 py-1 rounded border transition-all text-[8px] font-bold uppercase flex items-center gap-1 cursor-pointer whitespace-nowrap",
                              u.currencyApproved 
                                ? "text-[#F59E0B] border-[#1E2638] bg-[#0B0F17] hover:bg-[#3B2D13]" 
                                : "text-emerald-400 border-emerald-500/30 bg-[#0B0F17] hover:bg-emerald-500/10"
                            )}
                            title={u.currencyApproved ? "Revoke Currency Clearance" : "Grant Currency Clearance"}
                          >
                            <TrendingUp size={11} />
                            {u.currency}: {u.currencyApproved ? 'Revoke' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0B0F17]/80 flex items-center justify-center z-50 p-6 backdrop-blur-md">
          <div className="bg-[#121824] rounded-xl border border-[#1E2638] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#1E2638] flex items-center justify-between bg-[#0B0F17]/40">
              <h3 className="text-base font-black text-[#F59E0B] uppercase tracking-widest">Create New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8E9BAE] hover:text-[#F59E0B] transition-colors">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-[#121824]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none text-xs font-medium !bg-[#0B0F17] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Username / Email</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none text-xs font-medium !bg-[#0B0F17] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Access Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none text-xs font-medium !bg-[#0B0F17] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newUser.balance}
                    onChange={e => setNewUser({...newUser, balance: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none text-xs font-bold font-mono !bg-[#0B0F17] !text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Currency Base</label>
                  <select
                    value={newUser.currency}
                    onChange={e => setNewUser({...newUser, currency: e.target.value as any})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none text-xs font-bold font-mono !bg-[#0B0F17] !text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="PGK">PGK (K)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E9BAE] uppercase tracking-widest">Account Number</label>
                  <input
                    type="text"
                    required
                    value={newUser.accountNumber}
                    onChange={e => setNewUser({...newUser, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none font-mono text-xs font-bold !bg-[#0B0F17] !text-white"
                    placeholder="IST-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#1E2638] pt-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#F59E0B] uppercase tracking-wider">Transaction Code</label>
                  <input
                    type="text"
                    value={newUser.tc}
                    onChange={e => setNewUser({...newUser, tc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none font-mono text-xs !bg-[#0B0F17] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#F59E0B] uppercase tracking-wider">Verification Code</label>
                  <input
                    type="text"
                    value={newUser.vc}
                    onChange={e => setNewUser({...newUser, vc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none font-mono text-xs !bg-[#0B0F17] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#F59E0B] uppercase tracking-wider">Switch Code</label>
                  <input
                    type="text"
                    value={newUser.sc}
                    onChange={e => setNewUser({...newUser, sc: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none font-mono text-xs !bg-[#0B0F17] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-extrabold text-[#F59E0B] uppercase tracking-wider">Activation PIN</label>
                  <input
                    type="text"
                    value={newUser.activationPin}
                    onChange={e => setNewUser({...newUser, activationPin: e.target.value})}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F17] text-white border border-[#1E2638] rounded focus:border-[#F59E0B] outline-none font-mono text-xs !bg-[#0B0F17] !text-white"
                    placeholder="Auto-Gen"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-5 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#1E2638] hover:bg-[#3B2D13] text-[#8E9BAE] font-bold uppercase tracking-wider text-[10px] rounded transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#F59E0B] hover:bg-[#FF9500] text-[#0B0F17] font-black uppercase tracking-wider text-[10px] rounded hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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
