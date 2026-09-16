import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

const modeColor = {
  Cash: "bg-green-100 text-green-700",
  Online: "bg-blue-100 text-blue-700",
  Card: "bg-purple-100 text-purple-700",
  UPI: "bg-amber-100 text-amber-700",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/payments").then(({ data }) => setPayments(data)).finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.member?.memberId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black italic text-slate-800">Payments</h1>
        <p className="text-sm italic text-slate-400 mt-1">All payment records across members</p>
      </div>

      {/* Summary banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 flex items-center gap-4">
        <div className="text-3xl">💰</div>
        <div>
          <p className="text-xs italic font-semibold text-green-500 uppercase tracking-wider">Total Shown</p>
          <p className="text-2xl font-black italic text-green-800">{fmt(totalCollected)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search by member name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-4"
        />
      </div>

      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center italic text-slate-400 py-16 text-sm">No payment records found.</div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Member</th>
                <th className="table-th">Member ID</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Mode</th>
                <th className="table-th">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="table-td text-sm">{fmtDate(p.paymentDate)}</td>
                  <td className="table-td font-semibold italic text-slate-800">{p.member?.name || "—"}</td>
                  <td className="table-td font-mono text-xs text-slate-400">{p.member?.memberId || "—"}</td>
                  <td className="table-td font-bold text-green-600">{fmt(p.amount)}</td>
                  <td className="table-td">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold italic ${modeColor[p.paymentMode] || "bg-slate-100 text-slate-600"}`}>
                      {p.paymentMode}
                    </span>
                  </td>
                  <td className="table-td italic text-slate-400 text-sm">{p.note || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
