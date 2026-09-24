import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Send, 
  History, 
  User as UserIcon, 
  Bell, 
  ShieldCheck, 
  LogOut,
  Users,
  Settings,
  FileText,
  CreditCard,
  Smartphone,
  X,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MessageSquare
} from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";

interface SidebarProps {
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
  toggleSidebar: () => void;
}

export default function Sidebar({ user, onLogout, isOpen, isMobileOpen, onClose, toggleSidebar }: SidebarProps) {
  const userGroups = [
    {
      title: "MAIN PORTAL",
      links: [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/transfer", icon: Send, label: "Wire Transfer" },
        { to: "/transactions", icon: History, label: "Transaction History" },
      ]
    },
    {
      title: "SERVICES & BANKING",
      links: [
        { to: "/collection", icon: Landmark, label: "Bank Link" },
        { to: "/card-request", icon: Smartphone, label: "ATM Cards" },
        { to: "/profile", icon: UserIcon, label: "Profile" },
      ]
    }
  ];

  const adminGroups = [
    {
      title: "ADMINISTRATION",
      links: [
        { to: "/admin", icon: LayoutDashboard, label: "Control Center" },
        { to: "/admin/users", icon: Users, label: "Users Hub" },
        { to: "/admin/transfers", icon: FileText, label: "Transfers Ledger" },
        { to: "/admin/collections", icon: CreditCard, label: "Collections" },
        { to: "/admin/card-requests", icon: Smartphone, label: "Card Requests" },
        { to: "/admin/chat", icon: MessageSquare, label: "Live Chat" },
        { to: "/admin/settings", icon: Settings, label: "Global Settings" },
      ]
    }
  ];

  const groups = user.role === 'admin' ? adminGroups : userGroups;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 flex flex-col h-full z-50 transition-all duration-500 lg:relative border-r border-[#1E2638]",
        "bg-[#121824] text-slate-200",
        isOpen ? "w-64" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Desktop Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 bg-[#F59E0B] text-[#0B0F17] items-center justify-center rounded-full shadow-md z-50 border border-[#1E2638] hover:bg-[#FF9500] cursor-pointer transition-colors"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={cn(
          "h-16 border-b border-[#1E2638] flex items-center px-6 transition-all duration-500",
          isOpen ? "justify-between" : "justify-center"
        )}>
          <div className={cn("flex items-center gap-5 overflow-hidden transition-all duration-500", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
            <div className="w-8 h-8 flex items-center justify-center bg-[#0B0F17] text-[#F59E0B] rounded-md border border-[#1E2638] shadow-md">
              <ShieldCheck size={18} />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-sm leading-tight tracking-tight text-[#F59E0B]">INTERNET SUPPORT TEAM</h1>
              <p className="text-[7px] font-bold tracking-widest uppercase text-[#8E9BAE]">Intl. Transfer Office</p>
            </div>
          </div>
          
          {!isOpen && (
            <div className="w-8 h-8 flex items-center justify-center bg-[#0B0F17] text-[#F59E0B] rounded-md border border-[#1E2638]">
              <ShieldCheck size={18} />
            </div>
          )}

          <button onClick={onClose} className="lg:hidden text-[#8E9BAE] hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className={cn(
                "px-4 text-[10px] font-black uppercase tracking-widest text-[#8E9BAE] mb-3 transition-all duration-500",
                isOpen ? "opacity-100" : "opacity-0"
              )}>
                {isOpen ? group.title : ""}
              </div>
              
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      "flex items-center gap-5 px-3 py-3 transition-all duration-200 group relative rounded-md text-xs font-medium",
                      isActive 
                        ? "bg-[#1E2638] text-white border-l-2 border-[#F59E0B] font-semibold"
                        : "text-[#8E9BAE] hover:text-slate-200 hover:bg-[#1E2638]/50"
                    )}
                  >
                    <link.icon size={18} className={cn("shrink-0 transition-colors", !isOpen && "mx-auto")} />
                    <span className={cn(
                      "whitespace-nowrap transition-all duration-500",
                      isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 absolute"
                    )}>
                      {link.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-[#1E2638] bg-[#0B0F17]/30">
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-5 px-3 py-3 w-full transition-all duration-200 group rounded-md text-xs font-medium",
              "text-red-400 hover:text-red-300 hover:bg-red-950/20"
            )}
          >
            <LogOut size={18} className={cn("shrink-0", !isOpen && "mx-auto")} />
            <span className={cn(
              "whitespace-nowrap transition-all duration-500",
              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 absolute"
            )}>
              Secure Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
