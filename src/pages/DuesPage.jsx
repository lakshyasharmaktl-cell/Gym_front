import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdWarning } from "react-icons/md";
import api from "../api/axiosConfig";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

export default function DuesPage() {
  const [dueMembers, setDueMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/members/dues").then(({ data }) => setDueMembers(data)).finally(() => setLoading(false));
  }, []);

  const totalDue = dueMembers.reduce((sum, m) => sum + (m.membership?.dueAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black italic text-slate-800">Pending Dues</h1>
        <p className="text-sm italic text-slate-400 mt-1">Members with outstanding balance</p>
      </div>

      {/* Total due banner */}
      {dueMembers.length > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-300 rounded-xl px-6 py-4">
          <MdWarning className="text-amber-500 text-3xl flex-shrink-0" />
          <div>
            <p className="text-xs italic font-semibold text-amber-500 uppercase tracking-wider">Total Outstanding</p>
            <p className="text-2xl font-black italic text-amber-800">{fmt(totalDue)}</p>
            <p className="text-xs italic text-amber-600">{dueMembers.length} member(s) have pending dues</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
        </div>
      ) : dueMembers.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="italic text-slate-500 font-semibold text-lg">All dues are cleared!</p>
          <p className="italic text-slate-400 text-sm mt-1">No members have pending balance.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="table-th">Member</th>
                <th className="table-th">ID</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Plan</th>
                <th className="table-th">Total Fee</th>
                <th className="table-th">Paid</th>
                <th className="table-th">Due</th>
                <th className="table-th">Expiry</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {dueMembers.map((m, i) => (
                <motion.tr
                  key={m._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-red-50 transition"
                >
                  <td className="table-td font-semibold italic text-slate-800">{m.name}</td>
                  <td className="table-td font-mono text-xs text-slate-400">{m.memberId}</td>
                  <td className="table-td">{m.phone}</td>
                  <td className="table-td">{m.membership?.plan?.planName || "—"}</td>
                  <td className="table-td">{fmt(m.membership?.totalFee)}</td>
                  <td className="table-td text-green-600 font-semibold">{fmt(m.membership?.amountPaid)}</td>
                  <td className="table-td">
                    <span className="font-black text-red-600 italic">{fmt(m.membership?.dueAmount)}</span>
                  </td>
                  <td className="table-td text-sm text-slate-400">{fmtDate(m.membership?.endDate)}</td>
                  <td className="table-td">
                    <button
                      onClick={() => navigate(`/members/${m._id}?tab=pay`)}
                      className="btn-gold text-xs px-3 py-1"
                    >
                      Collect Due
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
