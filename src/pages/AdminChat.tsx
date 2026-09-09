import React, { useState, useEffect, useRef } from "react";
import { Search, Send, User as UserIcon } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";

export default function AdminChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = () => {
    fetch("/api/admin/chat")
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => {}); // ignore network errors
  };

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => {});
    fetchChats();
    const interval = setInterval(fetchChats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      fetch("/api/admin/chat/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId })
      }).catch(() => {});
    }
  }, [selectedUserId, messages]);

  const uniqueUserIds = Array.from(new Set(messages.map(m => m.userId)));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUserId) return;

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, sender: "agent", text: inputMessage })
      });
      setInputMessage("");
      fetchChats();
    } catch (e) {
      console.error(e);
    }
  };

  const selectedMessages = messages.filter(m => m.userId === selectedUserId);

  return (
    <div className="space-y-6 text-slate-200 h-[calc(100vh-6rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Support Desk</h1>
        <p className="text-xs text-[#8E9BAE]">Manage live chat requests from clients.</p>
      </div>

      <div className="flex-1 bg-[#121824] rounded-xl border border-[#1E2638] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-0">
        
        {/* Chat List */}
        <div className="w-full md:w-1/3 border-r border-[#1E2638] flex flex-col min-h-0">
          <div className="p-4 border-b border-[#1E2638] bg-[#0B0F17]/40 font-black uppercase text-[10px] text-[#8E9BAE] tracking-widest">
            Active Conversations
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {uniqueUserIds.map(uid => {
              const u = users.find(user => user.id === uid);
              const userMessages = messages.filter(m => m.userId === uid);
              const lastMsg = userMessages[userMessages.length - 1];
              const unreadCount = userMessages.filter(m => m.sender === 'user' && !m.readAdmin).length;
              return (
                <button
                  key={uid}
                  onClick={() => setSelectedUserId(uid)}
                  className={cn(
                    "w-full text-left p-4 border-b border-[#1E2638]/50 hover:bg-[#0B0F17]/40 transition-colors relative",
                    selectedUserId === uid ? "bg-[#0B0F17] border-l-2 border-l-[#F59E0B]" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-white truncate pr-6">{u ? u.name : uid}</span>
                    <span className="text-[9px] text-[#8E9BAE] shrink-0">{lastMsg && new Date(lastMsg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-[#8E9BAE] truncate pr-6">{lastMsg?.text}</p>
                  {unreadCount > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
            {uniqueUserIds.length === 0 && (
              <div className="p-6 text-center text-xs text-[#8E9BAE]">No active chats</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="w-full md:w-2/3 flex flex-col min-h-0 bg-[#0B0F17]/20">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-[#1E2638] bg-[#0B0F17]/40 flex items-center justify-between">
                <span className="text-xs font-black text-white tracking-widest uppercase">
                  {users.find(u => u.id === selectedUserId)?.name || selectedUserId}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {selectedMessages.map(msg => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.sender === 'agent' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-xs",
                      msg.sender === 'agent' ? "bg-[#F59E0B] text-[#0B0F17] font-medium" : "bg-[#1E2638] text-white"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-[#8E9BAE] mt-1">
                      {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-[#1E2638] bg-[#0B0F17]/40">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-[#121824] border border-[#1E2638] text-white text-xs px-4 py-3 rounded-xl focus:border-[#F59E0B] outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-[#F59E0B] text-[#0B0F17] hover:bg-[#FF9500] rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#8E9BAE]">
              Select a conversation to reply
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
