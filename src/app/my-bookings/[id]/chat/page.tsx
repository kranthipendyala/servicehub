"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  id: number;
  booking_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const API_BASE = "/proxy-api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token");
}

export default function CustomerChatPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/chat/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token || "",
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const data = json.data;
      setMessages(Array.isArray(data) ? data : data?.messages || []);
      setError("");
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/chat/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token || "",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setNewMessage("");
      fetchMessages();
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-surface-200 rounded-t-card">
        <Link
          href={`/my-bookings/${bookingId}`}
          className="p-2 rounded-card hover:bg-surface-50 text-surface-500 hover:text-surface-700 transition-colors duration-200 ease-advia"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-bold text-surface-900">
            Booking #{bookingId}
          </p>
          <p className="text-xs text-surface-400">Chat with vendor</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
          <span className="text-[11px] text-surface-400 font-medium">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border-x border-surface-200 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-[2px] border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : error && messages.length === 0 ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-3 bg-accent-200 rounded-card flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm text-surface-500 font-medium">No messages yet</p>
            <p className="text-xs text-surface-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender_role === "customer";
            return (
              <div
                key={msg.id}
                className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-card px-4 py-3 ${
                    isCustomer
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-surface-200 text-surface-900"
                  }`}
                >
                  <p className={`text-[11px] font-semibold mb-1 ${isCustomer ? "text-primary-100" : "text-surface-400"}`}>
                    {msg.sender_name}
                  </p>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <div className={`flex items-center gap-1.5 mt-1.5 ${isCustomer ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${isCustomer ? "text-primary-200" : "text-surface-400"}`}>
                      {msg.created_at}
                    </span>
                    {isCustomer && msg.is_read && (
                      <svg className="w-3 h-3 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-surface-200 rounded-b-card"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-sm rounded-card border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 ease-advia"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="btn-primary !px-5 !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
          )}
        </button>
      </form>
    </div>
  );
}
