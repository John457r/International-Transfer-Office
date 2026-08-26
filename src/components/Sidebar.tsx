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
  const userLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/transfer", icon: Send, label: "Transfers" },
    { to: "/transactions", icon: History, label: "History" },
    { to: "/collection", icon: MessageSquare, label: "Messages" },
    { to: "/card-request", icon: Smartphone, label: "ATM Card" },
    { to: "/profile", icon: UserIcon, label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Admin Panel" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/transfers", icon: FileText, label: "Transfers" },
    { to: "/admin/collections", icon: CreditCard, label: "Collections" },
    { to: "/admin/card-requests", icon: Smartphone, label: "Cards" },
    { to: "/admin/settings", icon: Settings, label: "Security" },
  ];

  const links = user.role === 'admin' ? adminLinks : userLinks;

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
        "fixed inset-y-0 left-0 flex flex-col h-full z-50 transition-all duration-500 lg:relative border-r border-[#3B82F6]/20",
        "bg-[#1E293B] text-slate-200",
        isOpen ? "w-64" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Desktop Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-34 w-6 h-6 bg-[#3B82F6] text-[#0F172A] items-center justify-center rounded-full shadow-md z-50 border border-[#3B82F6]/30"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={cn(
          "h-16 border-b border-[#3B82F6]/15 flex items-center px-6 transition-all duration-500",
          isOpen ? "justify-between" : "justify-center"
        )}>
          <div className={cn("flex items-center gap-5 overflow-hidden transition-all duration-500", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
            <div className="w-8 h-8 flex items-center justify-center bg-[#0F172A] text-[#3B82F6] rounded-md border border-[#3B82F6]/30 shadow-md">
              <ShieldCheck size={18} />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-sm leading-tight tracking-tight text-[#3B82F6]">ITO BANK</h1>
              <p className="text-[7px] font-bold tracking-widest uppercase text-slate-400">Intl. Transfer Office</p>
            </div>
          </div>
          
          {!isOpen && (
            <div className="w-8 h-8 flex items-center justify-center bg-[#0F172A] text-[#3B82F6] rounded-md border border-[#3B82F6]/30">
              <ShieldCheck size={18} />
            </div>
          )}

          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-5 px-3 py-3 transition-all duration-200 group relative rounded-md text-xs font-medium",
                isActive 
                  ? "bg-[#0F172A] text-[#3B82F6] border-l-2 border-[#3B82F6] font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#0F172A]/40"
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
        </nav>
        
        <div className="p-6 border-t border-[#3B82F6]/15 bg-[#0F172A]/30">
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
