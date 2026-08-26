import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { User } from "../types";
import { LogOut, Bell, User as UserIcon, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-100 font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-34 -right-24 w-96 h-96 bg-[#3B82F6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1E293B]/30 blur-[120px] rounded-full"></div>
      </div>
      
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 z-10 border-b bg-[#1E293B]/85 backdrop-blur-xl border-[#3B82F6]/15">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-3 text-[#3B82F6] hover:bg-white/5 transition-colors rounded-md"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                {user.role === 'admin' ? 'Command Center' : 'Client Portal'}
              </h2>
              <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-[0.3em] mt-0.5">
                {user.role === 'admin' ? 'System Administration' : 'Secure Banking Interface'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#0F172A]/50 border border-[#3B82F6]/20 rounded">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">System Online</span>
            </div>

            <button className="relative p-3 text-slate-400 hover:text-[#3B82F6] transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-2 w-2 h-2 bg-[#3B82F6] rounded-full border-2 border-[#1E293B]"></span>
            </button>
            
            <div className="flex items-center gap-6 pl-4 sm:pl-8 border-l border-[#3B82F6]/20">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black uppercase text-white leading-none">{user.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#3B82F6] mt-1 opacity-70">{user.role}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center font-black text-base bg-gradient-to-br from-[#3B82F6] to-[#1E293B] text-[#0F172A] border border-[#3B82F6]/30 shadow-md">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
