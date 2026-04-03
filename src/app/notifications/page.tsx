"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getNotifications, markNotificationRead, getUnreadCount } from "@/lib/booking-api";
import type { Notification } from "@/types";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  booking_created: { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-blue-600", bg: "bg-blue-50" },
  booking_confirmed: { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-600", bg: "bg-green-50" },
  booking_started: { icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-indigo-600", bg: "bg-indigo-50" },
  booking_completed: { icon: "M5 13l4 4L19 7", color: "text-primary-600", bg: "bg-primary-50" },
  booking_cancelled: { icon: "M6 18L18 6M6 6l12 12", color: "text-red-600", bg: "bg-red-50" },
  payment_received: { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-purple-600", bg: "bg-purple-50" },
  new_chat_message: { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "text-cyan-600", bg: "bg-cyan-50" },
};

const DEFAULT_CONFIG = { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", color: "text-gray-600", bg: "bg-gray-50" };

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login?redirect=/notifications"); return; }
    loadNotifications();
  }, [user, router]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        const data = res.data as any;
        setNotifications(Array.isArray(data) ? data : data?.notifications || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleRead = async (id: number) => {
    try { await markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); } catch {}
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">Stay updated on your bookings and services</p>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No notifications yet</h3>
          <p className="text-gray-400 text-sm">You&apos;ll see booking updates here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || DEFAULT_CONFIG;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${n.is_read ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"}`}
              >
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${n.is_read ? "text-gray-700" : "text-gray-900"}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  {!n.is_read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
