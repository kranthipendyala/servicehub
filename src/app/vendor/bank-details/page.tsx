"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import { getBankDetails, saveBankDetails, BankDetails } from "@/lib/vendor-api";

const emptyForm: BankDetails = {
  account_holder_name: "",
  account_number: "",
  ifsc_code: "",
  bank_name: "",
  branch_name: "",
  upi_id: "",
};

export default function VendorBankDetailsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<BankDetails>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBankDetails();
        if (res.data) setForm({ ...emptyForm, ...res.data });
      } catch {
        // no existing bank details
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_holder_name || !form.account_number || !form.ifsc_code || !form.bank_name) {
      toast("Please fill all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      await saveBankDetails(form);
      toast("Bank details saved successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save bank details", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Bank Details</h1>
      <p className="text-sm text-gray-500">
        Your payout will be sent to this bank account. Please ensure all details are accurate.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="account_holder_name"
            value={form.account_holder_name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ifsc_code"
              value={form.ifsc_code}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bank_name"
              value={form.bank_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name
          </label>
          <input
            type="text"
            name="branch_name"
            value={form.branch_name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UPI ID
          </label>
          <input
            type="text"
            name="upi_id"
            value={form.upi_id || ""}
            onChange={handleChange}
            placeholder="yourname@upi"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bank Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
