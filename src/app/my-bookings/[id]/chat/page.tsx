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
      setMessages(json.data || []);
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
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-t-xl">
        <Link
          href={`/my-bookings/${bookingId}`}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Booking #{bookingId}
          </p>
          <p className="text-xs text-gray-500">Chat with vendor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-200 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && messages.length === 0 ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender_role === "customer";
            return (
              <div
                key={msg.id}
                className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                    isCustomer
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${isCustomer ? "text-emerald-100" : "text-gray-500"}`}>
                    {msg.sender_name}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isCustomer ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${isCustomer ? "text-emerald-200" : "text-gray-400"}`}>
                      {msg.created_at}
                    </span>
                    {isCustomer && msg.is_read && (
                      <svg className="w-3 h-3 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-b-xl"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
