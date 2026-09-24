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
    <div className="flex h-screen bg-[#0B0F17] text-slate-100 font-sans relative overflow-hidden">
      {/* Deep Obsidian Grid Background & Glowing Amber Halos */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjQ1LCAxNTgsIDExLCAwLjE1KSIvPjwvc3ZnPg==')] opacity-30 mix-blend-screen" />
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#F59E0B]/10 blur-[120px] rounded-full animate-pulse [animation-duration:10s]"></div>
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] bg-[#F59E0B]/5 blur-[100px] rounded-full animate-pulse [animation-duration:15s]"></div>
        <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-[#F59E0B]/5 blur-[120px] rounded-full"></div>
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
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 z-10 border-b border-amber-500/10 bg-[#0B0F17]/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-3 text-[#F59E0B] hover:bg-white/5 transition-colors rounded-md"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                {user.role === 'admin' ? 'Command Center' : 'Client Terminal'}
              </h2>
              <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.3em] mt-0.5 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">
                {user.role === 'admin' ? 'System Administration' : 'Secure Banking Interface'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#121824]/80 backdrop-blur-md border border-amber-500/20 rounded shadow-[0_0_10px_rgba(245,158,11,0.05)]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">System Online</span>
            </div>

            <button className="relative p-3 text-[#8E9BAE] hover:text-[#F59E0B] hover:drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] transition-all">
              <Bell size={20} />
              <span className="absolute top-3 right-2 w-2 h-2 bg-[#F59E0B] rounded-full border-2 border-[#121824] shadow-[0_0_5px_rgba(245,158,11,1)]"></span>
            </button>
            
            <div className="flex items-center gap-6 pl-4 sm:pl-8 border-l border-amber-500/20">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black uppercase text-white leading-none">{user.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#F59E0B] mt-1 opacity-90 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">
                  {user.role === 'admin' ? 'Support Team Admin' : 'Verified Client'}
                </p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center font-black text-base bg-gradient-to-br from-[#F59E0B] to-[#b37000] text-[#0B0F17] border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] relative">
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                <span className="relative z-10">{user.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
