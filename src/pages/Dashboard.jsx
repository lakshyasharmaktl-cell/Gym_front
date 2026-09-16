import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdPeople, MdCheckCircle, MdWarning, MdTrendingUp, MdTrendingDown, MdAccountBalance } from "react-icons/md";
import StatCard from "../components/StatCard";
import api from "../api/axiosConfig";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then(({ data }) => setStats(data))
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-600 italic">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black italic text-slate-800">Dashboard</h1>
        <p className="text-sm italic text-slate-400 mt-1">Welcome back — here's your gym overview</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers}
          icon={<MdPeople />}
          color="slate"
          sub="All registered members"
        />
        <StatCard
          title="Active Members"
          value={stats?.activeMembers}
          icon={<MdCheckCircle />}
          color="green"
          sub="Current active memberships"
        />
        <StatCard
          title="Pending Dues"
          value={stats?.pendingDueMembers}
          icon={<MdWarning />}
          color="amber"
          sub="Members with outstanding dues"
        />
        <StatCard
          title="Total Revenue"
          value={fmt(stats?.totalRevenue || 0)}
          icon={<MdTrendingUp />}
          color="blue"
          sub="All time collected payments"
        />
        <StatCard
          title="Total Expenses"
          value={fmt(stats?.totalExpense || 0)}
          icon={<MdTrendingDown />}
          color="red"
          sub="All time expenses"
        />
        <StatCard
          title="Net Profit"
          value={fmt(stats?.netProfit || 0)}
          icon={<MdAccountBalance />}
          color="purple"
          sub="Revenue minus expenses"
        />
      </div>

      {/* Due Amount Banner */}
      {stats?.totalDueAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4"
        >
          <MdWarning className="text-amber-500 text-3xl flex-shrink-0" />
          <div>
            <p className="font-bold italic text-amber-800 text-lg">
              Total Pending Dues: {fmt(stats.totalDueAmount)}
            </p>
            <p className="text-sm italic text-amber-600 mt-0.5">
              {stats.pendingDueMembers} member(s) have outstanding balance. Go to Dues page to collect.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
