import { useState, useEffect } from "react";
import { SecuritySettings } from "../types";
import { Shield, Lock, Bell, Globe, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleToggle = (key: keyof SecuritySettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    if (!settings) return;
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (response.ok) {
          toast.success("Security settings updated");
        }
      } catch (error) {
        toast.error("Failed to update settings");
      } finally {
        setLoading(false);
      }
    }, 5000);
  };

  if (!settings) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#F59E0B]" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Security Protocol Settings</h1>
          <p className="text-xs text-[#8E9BAE]">Configure global transaction verification requirements.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] cursor-pointer rounded font-black uppercase tracking-wider transition-all disabled:opacity-75 border border-[#1E2638] shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#121824] p-8 rounded-xl border border-[#1E2638] space-y-8 shadow-2xl">
          <div className="flex items-center gap-6 pb-6 border-b border-[#1E2638]">
            <div className="w-12 h-12 bg-[#0B0F17] text-[#F59E0B] rounded flex items-center justify-center border border-[#1E2638]">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-tight">Transfer Verification Codes</h3>
              <p className="text-xs text-[#8E9BAE] font-bold uppercase tracking-wider">Enable or disable mandatory codes for international transfers.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-red-950/20 border border-red-500/20 rounded">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-[#0B0F17] rounded flex items-center justify-center text-red-400 border border-red-500/25 shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs uppercase tracking-tight">Global Transfer Kill-Switch</p>
                  <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Enable or disable all outgoing transfers system-wide.</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('transfersEnabled')}
                className={`w-12 h-6 rounded-full relative transition-colors border ${settings.transfersEnabled ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-750 border-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${settings.transfersEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-[#0B0F17]/60 border border-[#1E2638] rounded">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-[#121824] rounded flex items-center justify-center text-[#F59E0B] shadow-sm border border-[#1E2638]">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs uppercase tracking-tight">Transaction Code (TC)</p>
                  <p className="text-[10px] text-[#8E9BAE] font-bold uppercase tracking-wider">Required for initial transfer authorization.</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('requireTransactionCode')}
                className={`w-12 h-6 rounded-full relative transition-colors border ${settings.requireTransactionCode ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-755 border-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${settings.requireTransactionCode ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-[#0B0F17]/60 border border-[#1E2638] rounded">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-[#121824] rounded flex items-center justify-center text-[#F59E0B] shadow-sm border border-[#1E2638]">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs uppercase tracking-tight">Verification Code (VC)</p>
                  <p className="text-[10px] text-[#8E9BAE] font-bold uppercase tracking-wider">Secondary security layer for high-value transfers.</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('requireVerificationCode')}
                className={`w-12 h-6 rounded-full relative transition-colors border ${settings.requireVerificationCode ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-755 border-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${settings.requireVerificationCode ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-[#0B0F17]/60 border border-[#1E2638] rounded">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-[#121824] rounded flex items-center justify-center text-[#F59E0B] shadow-sm border border-[#1E2638]">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs uppercase tracking-tight">Switch Code (SC)</p>
                  <p className="text-[10px] text-[#8E9BAE] font-bold uppercase tracking-wider">Final clearance code for cross-border network switching.</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('requireSwitchCode')}
                className={`w-12 h-6 rounded-full relative transition-colors border ${settings.requireSwitchCode ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-755 border-slate-600'}`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${settings.requireSwitchCode ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-[#1E2638] p-6 rounded-xl">
          <h4 className="font-extrabold text-[#F59E0B] mb-2 flex items-center gap-3 text-xs uppercase tracking-wider">
            <Shield size={16} /> Important Security Note
          </h4>
          <p className="text-xs text-[#8E9BAE] leading-relaxed font-semibold uppercase font-mono">
            Disabling these codes reduces the security level of the platform. Keep all verification layers active for compliance and audit controls.
          </p>
        </div>
      </div>
    </div>
  );
}
