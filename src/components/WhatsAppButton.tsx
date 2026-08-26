import React, { useState, useEffect, useRef, FormEvent } from "react";
import { MessageCircle, X, Send, User, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
}

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "agent",
      text: "Hello! Welcome to the International Transfer Office Security & Support desk. How can we assist you with your transfer or card today?",
      time: "Just now",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Listen to custom global events (so buttons on other pages can open this floating support screen)
  useEffect(() => {
    const handleOpenSupport = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-support-chat", handleOpenSupport);
    return () => {
      window.removeEventListener("open-support-chat", handleOpenSupport);
    };
  }, []);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate agent auto-reply
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "We have received your request. A security agent is currently reviewing your account details. Support Ticket ID: #ITO-" + Math.floor(100000 + Math.random() * 900000);
      
      const lower = userMsg.text.toLowerCase();
      if (lower.includes("transfer") || lower.includes("pending") || lower.includes("verify")) {
        replyText = "For pending transfers, please ensure you have completed the sequential Transaction Code (TC), Verification Code (VC), and Switch Code (SC) approvals assigned by your Administrator. If your transfer is blocked, please check your Dashboard status message or contact your Account Coordinator.";
      } else if (lower.includes("code") || lower.includes("tc") || lower.includes("vc") || lower.includes("sc")) {
        replyText = "Your security codes (TC, VC, SC) are uniquely generated for secure transactions. Please coordinate with your Admin to view, update, or clear these credentials on your account.";
      } else if (lower.includes("card") || lower.includes("atm")) {
        replyText = "Physical ATM Card requests take 3-5 business days to process after validation. Please check your Card Request log inside your Portal.";
      }

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1500);
  };

  const handleFAQClick = (faqText: string) => {
    setInputMessage(faqText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#0F172A] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all group relative border border-[#3B82F6]/30"
        title="Contact Secure Support Desk"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-[#1E293B] border border-[#3B82F6]/35 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Secure Support Help
          </span>
        )}
      </button>

      {/* Support Chat Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-[#1E293B] border border-[#3B82F6]/35 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-[#0F172A] text-white p-6 border-b border-[#3B82F6]/25 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center border border-[#3B82F6]/20">
                <ShieldCheck size={20} className="text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-white">Support Terminal</h3>
                <p className="text-[9px] text-[#3B82F6] flex items-center gap-1 font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Security Desk Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-[#0F172A]/60 border-b border-[#3B82F6]/15 px-4 py-2 flex items-center gap-3">
            <HelpCircle size={14} className="text-[#3B82F6] shrink-0" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SECURE DIRECT PROTOCOL ACTIVE</span>
          </div>

          {/* Message List */}
          <div className="flex-grow p-6 space-y-6 max-h-72 overflow-y-auto bg-[#0F172A]/40 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%] rounded p-5 text-[11px] leading-relaxed border font-medium",
                  msg.sender === "agent"
                    ? "bg-[#1E293B] border-[#3B82F6]/20 text-slate-200 self-start mr-auto"
                    : "bg-[#0F172A] border-[#3B82F6]/35 text-[#3B82F6] self-end ml-auto"
                )}
              >
                <p className="uppercase">{msg.text}</p>
                <span className={cn(
                  "text-[8px] mt-1 text-right block font-bold font-mono tracking-wider",
                  msg.sender === "agent" ? "text-slate-400" : "text-slate-300"
                )}>
                  {msg.time}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-[#1E293B] border border-[#3B82F6]/15 text-slate-400 self-start mr-auto max-w-[80%] rounded p-5 text-[9px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Suggestions */}
          <div className="p-5 border-t border-[#3B82F6]/15 bg-[#0F172A]/60 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleFAQClick("Check pending transfer verification status.")}
              className="px-2.5 py-1 text-[8px] bg-[#1E293B] border border-[#3B82F6]/20 rounded text-slate-300 hover:text-white hover:border-[#3B82F6] font-semibold uppercase tracking-widest transition-colors"
            >
              Verify Transfer
            </button>
            <button
              onClick={() => handleFAQClick("How to clear security codes (TC, VC, SC)?")}
              className="px-2.5 py-1 text-[8px] bg-[#1E293B] border border-[#3B82F6]/20 rounded text-slate-300 hover:text-white hover:border-[#3B82F6] font-semibold uppercase tracking-widest transition-colors"
            >
              Clear Codes
            </button>
            <button
              onClick={() => handleFAQClick("Request physical ATM card details.")}
              className="px-2.5 py-1 text-[8px] bg-[#1E293B] border border-[#3B82F6]/20 rounded text-slate-300 hover:text-white hover:border-[#3B82F6] font-semibold uppercase tracking-widest transition-colors"
            >
              ATM Card
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-5 border-t border-[#3B82F6]/15 bg-[#0F172A] flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message to Security Desk..."
              className="flex-grow border border-[#3B82F6]/20 bg-[#1E293B] text-white rounded px-3 py-1.5 text-xs outline-none focus:border-[#3B82F6] placeholder:text-slate-500 focus:ring-0"
            />
            <button
              type="submit"
              className="w-8 h-8 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#0F172A] rounded flex items-center justify-center transition-colors"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
