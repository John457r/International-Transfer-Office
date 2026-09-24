import React, { useState, useEffect, useRef, FormEvent } from "react";
import { MessageCircle, X, Send, User as UserIcon, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { User } from "../types";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
}

export default function WhatsAppButton({ user }: { user?: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define fallback guest ID if no user is logged in
  const userId = user?.id || localStorage.getItem("guest_chat_id") || "guest_" + Math.floor(Math.random() * 1000000);
  
  useEffect(() => {
    if (!user && !localStorage.getItem("guest_chat_id")) {
      localStorage.setItem("guest_chat_id", userId);
    }
  }, [user, userId]);

  useEffect(() => {
    const fetchMessages = () => {
      fetch(`/api/chat/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            setMessages([{
              id: "welcome",
              sender: "agent",
              text: "Hello! Welcome to the Internet Support Team Security & Support desk. How can we assist you with your transfer or card today?",
              time: new Date().toISOString()
            }]);
          } else {
            setMessages(data);
          }
        })
        .catch(err => {
          // Silently ignore network errors during polling
        });
    };
    
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen]);

  // Listen to custom global events (so buttons on other pages can open this floating support screen)
  useEffect(() => {
    const handleOpenSupport = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-support-chat", handleOpenSupport);
    window.addEventListener("open-live-chat", handleOpenSupport);
    return () => {
      window.removeEventListener("open-support-chat", handleOpenSupport);
      window.removeEventListener("open-live-chat", handleOpenSupport);
    };
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = inputMessage;
    setInputMessage("");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sender: "user",
          text: newMsg
        })
      });
      // The interval will pick it up, or we can optimism add it
    } catch (e) {
      console.error(e);
    }
  };

  const handleFAQClick = (faqText: string) => {
    setInputMessage(faqText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#F59E0B] hover:bg-[#FF9500] text-[#0B0F17] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all group relative border border-[#1E2638]"
        title="Contact Secure Support Desk"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-[#121824] border border-[#1E2638] text-slate-200 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Secure Support Help
          </span>
        )}
      </button>

      {/* Support Chat Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-[#121824] border border-[#1E2638] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-[#0B0F17] text-white p-6 border-b border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-9 h-9 bg-[#121824] rounded-xl flex items-center justify-center border border-[#1E2638]">
                <ShieldCheck size={20} className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-white">Support Terminal</h3>
                <p className="text-[9px] text-[#F59E0B] flex items-center gap-1 font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Security Desk Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#8E9BAE] hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-[#0B0F17]/60 border-b border-[#1E2638] px-4 py-2 flex items-center gap-3">
            <HelpCircle size={14} className="text-[#F59E0B] shrink-0" />
            <span className="text-[8px] font-bold text-[#8E9BAE] uppercase tracking-widest">SECURE DIRECT PROTOCOL ACTIVE</span>
          </div>

          {/* Message List */}
          <div className="flex-grow p-6 space-y-6 max-h-72 overflow-y-auto bg-[#0B0F17]/40 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded p-5 text-[11px] leading-relaxed border font-medium",
                  msg.sender === "agent"
                    ? "bg-[#121824] border-[#1E2638] text-slate-200 self-start mr-auto"
                    : "bg-[#0B0F17] border-[#1E2638] text-[#F59E0B] self-end ml-auto"
                )}
              >
                <p className="uppercase">{msg.text}</p>
                <span className={cn(
                  "text-[8px] mt-1 text-right block font-bold font-mono tracking-wider",
                  msg.sender === "agent" ? "text-[#8E9BAE]" : "text-[#8E9BAE]"
                )}>
                  {msg.time}
                </span>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Suggestions */}
          <div className="p-5 border-t border-[#1E2638] bg-[#0B0F17]/60 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleFAQClick("Check pending transfer verification status.")}
              className="px-2.5 py-1 text-[8px] bg-[#121824] border border-[#1E2638] rounded text-[#8E9BAE] hover:text-white hover:border-[#F59E0B] font-semibold uppercase tracking-widest transition-colors"
            >
              Verify Transfer
            </button>
            <button
              onClick={() => handleFAQClick("How to clear security codes (TC, VC, SC)?")}
              className="px-2.5 py-1 text-[8px] bg-[#121824] border border-[#1E2638] rounded text-[#8E9BAE] hover:text-white hover:border-[#F59E0B] font-semibold uppercase tracking-widest transition-colors"
            >
              Clear Codes
            </button>
            <button
              onClick={() => handleFAQClick("Request physical ATM card details.")}
              className="px-2.5 py-1 text-[8px] bg-[#121824] border border-[#1E2638] rounded text-[#8E9BAE] hover:text-white hover:border-[#F59E0B] font-semibold uppercase tracking-widest transition-colors"
            >
              ATM Card
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-5 border-t border-[#1E2638] bg-[#0B0F17] flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message to Security Desk..."
              className="flex-grow border border-[#1E2638] bg-[#121824] text-white rounded px-3 py-1.5 text-xs outline-none focus:border-[#F59E0B] placeholder:text-[#8E9BAE] focus:ring-0"
            />
            <button
              type="submit"
              className="w-8 h-8 bg-[#F59E0B] hover:bg-[#FF9500] text-[#0B0F17] rounded flex items-center justify-center transition-colors"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
