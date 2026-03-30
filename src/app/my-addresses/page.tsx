"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAddresses, createAddress, deleteAddress } from "@/lib/booking-api";
import type { Address } from "@/types";

export default function MyAddressesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Home", full_name: "", phone: "", address_line1: "", address_line2: "", pin_code: "", is_default: false });

  useEffect(() => {
    if (!user) { router.push("/login?redirect=/my-addresses"); return; }
    loadAddresses();
  }, [user, router]);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      if (res.success) setAddresses(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.address_line1 || !form.pin_code) return;
    setSaving(true);
    try {
      const res = await createAddress(form as any);
      if (res.success) { setAddresses(prev => [...prev, res.data]); setShowForm(false); setForm({ label: "Home", full_name: "", phone: "", address_line1: "", address_line2: "", pin_code: "", is_default: false }); }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try { await deleteAddress(id); setAddresses(prev => prev.filter(a => a.id !== id)); } catch {}
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your saved delivery addresses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-semibold hover:bg-accent-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No addresses saved</h3>
          <p className="text-gray-400 text-sm">Add your first address for faster booking</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{addr.label}</span>
                  {addr.is_default && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                </div>
                <p className="text-sm text-gray-600">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="text-sm text-gray-500">{addr.city_name ? `${addr.city_name} - ` : ""}{addr.pin_code}</p>
                {addr.phone && <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>}
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-6 bg-white rounded-xl border-2 border-accent-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">New Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Label</label><select value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm"><option>Home</option><option>Office</option><option>Other</option></select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Full Name</label><input value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
          </div>
          <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Phone</label><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="+91 98765 43210" /></div>
          <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Address Line 1 *</label><input value={form.address_line1} onChange={e => setForm(p => ({...p, address_line1: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Street, building, area" /></div>
          <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Address Line 2</label><input value={form.address_line2} onChange={e => setForm(p => ({...p, address_line2: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Landmark (optional)" /></div>
          <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">PIN Code *</label><input value={form.pin_code} onChange={e => setForm(p => ({...p, pin_code: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="400001" maxLength={6} /></div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-accent-500 text-white rounded-lg text-sm font-semibold hover:bg-accent-600 disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save Address"}</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
