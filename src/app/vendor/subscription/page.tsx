"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  subscribePlan,
  cancelSubscription,
  SubscriptionPlan,
  VendorSubscription,
} from "@/lib/vendor-api";

export default function VendorSubscriptionPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription(),
      ]);
      setPlans(plansRes.data || []);
      setCurrent(subRes.data);
    } catch {
      toast("Failed to load subscription data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (planId: number) => {
    setActionLoading(true);
    try {
      await subscribePlan(planId, cycle);
      toast("Subscription activated successfully", "success");
      fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to subscribe", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setActionLoading(true);
    try {
      await cancelSubscription();
      toast("Subscription cancelled", "success");
      fetchData();
    } catch {
      toast("Failed to cancel subscription", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>

      {/* Current Plan */}
      {current && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Current Plan</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {current.plan_name || "Active Plan"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {current.billing_cycle === "annual" ? "Annual" : "Monthly"} billing
                &middot; Expires {current.ends_at}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                  current.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {current.status}
              </span>
              {current.status === "active" && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            cycle === "monthly" ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setCycle(cycle === "monthly" ? "annual" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            cycle === "annual" ? "bg-primary-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              cycle === "annual" ? "translate-x-6" : ""
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            cycle === "annual" ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Annual{" "}
          <span className="text-primary-600 text-xs font-semibold">Save 20%</span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price =
            cycle === "monthly" ? plan.monthly_price : plan.annual_price;
          const isCurrentPlan = current?.plan_id === plan.id && current?.status === "active";
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-shadow hover:shadow-lg ${
                plan.is_popular
                  ? "border-primary-500 shadow-md"
                  : "border-gray-200"
              } ${isCurrentPlan ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
            >
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-gray-500">
                  /{cycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {(plan.features || []).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  Up to {plan.max_services} services
                </li>
                {plan.commission_discount > 0 && (
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {plan.commission_discount}% commission discount
                  </li>
                )}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={actionLoading || isCurrentPlan}
                className={`mt-6 w-full py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                  plan.is_popular
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
