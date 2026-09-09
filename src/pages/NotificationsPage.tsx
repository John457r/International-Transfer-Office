import { Bell, Info, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "../lib/utils";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Security Alert",
      message: "A new login was detected from a Chrome browser on Windows in London, UK.",
      time: "2 hours ago",
      type: "alert",
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-950/20 border border-amber-500/30"
    },
    {
      id: 2,
      title: "Transfer Completed",
      message: "Your transfer of $5,000.00 to Global Bank has been successfully processed.",
      time: "5 hours ago",
      type: "success",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-950/20 border border-emerald-500/30"
    },
    {
      id: 3,
      title: "New Feature Available",
      message: "You can now link your external internet banking accounts for easier transfers.",
      time: "1 day ago",
      type: "info",
      icon: Info,
      color: "text-[#F59E0B] bg-[#121824] border border-[#1E2638]"
    },
    {
      id: 4,
      title: "Account Statement",
      message: "Your monthly account statement for February 2024 is now available for download.",
      time: "3 days ago",
      type: "info",
      icon: Bell,
      color: "text-slate-200 bg-[#121824] border border-[#1E2638]"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Notifications</h1>
        <p className="text-[#8E9BAE] text-xs">Stay updated with your account activity and security alerts.</p>
      </div>

      <div className="bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl">
        <div className="divide-y divide-[#1E2638]">
          {notifications.map((n) => (
            <div key={n.id} className="p-6 flex gap-6 hover:bg-[#0B0F17]/40 transition-colors cursor-pointer group border-b last:border-b-0 border-[#1E2638]">
              <div className={cn("w-12 h-12 rounded flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", n.color)}>
                <n.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-white uppercase tracking-tight text-sm">{n.title}</h3>
                  <span className="text-[9px] font-bold text-[#8E9BAE] flex items-center gap-1 uppercase tracking-wider">
                    <Clock size={11} /> {n.time}
                  </span>
                </div>
                <p className="text-xs text-[#8E9BAE] leading-normal font-medium uppercase font-mono">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#0B0F17]/60 text-center border-t border-[#1E2638]">
          <button className="text-xs font-black text-[#F59E0B] hover:text-[#FF9500] uppercase tracking-widest transition-colors">Mark all as read</button>
        </div>
      </div>
    </div>
  );
}
