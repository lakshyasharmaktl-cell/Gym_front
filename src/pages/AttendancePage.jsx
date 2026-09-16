import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

export default function AttendancePage() {
  const [members, setMembers] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([
        api.get("/members"),
        api.get("/attendance/today"),
      ]);
      setMembers(m.data);
      setTodayRecords(t.data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const markAttendance = async (memberId, status = "Present") => {
    try {
      await api.post("/attendance", { memberId, status });
      showMsg(`Marked ${status} for member!`);
      load();
    } catch (err) { showMsg(err.response?.data?.message || "Failed to mark.", "error"); }
  };

  const markedIds = new Set(todayRecords.map((r) => r.member?._id));

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black italic text-slate-800">Attendance</h1>
        <p className="text-sm italic text-slate-400 mt-1">
          Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        <div className="card border border-green-200 bg-green-50 flex items-center gap-3 py-3 px-5">
          <span className="text-2xl font-black italic text-green-700">{todayRecords.filter(r => r.status === "Present").length}</span>
          <span className="text-sm italic text-green-600">Present Today</span>
        </div>
        <div className="card border border-red-200 bg-red-50 flex items-center gap-3 py-3 px-5">
          <span className="text-2xl font-black italic text-red-700">{todayRecords.filter(r => r.status === "Absent").length}</span>
          <span className="text-sm italic text-red-600">Absent Today</span>
        </div>
        <div className="card border border-slate-200 flex items-center gap-3 py-3 px-5">
          <span className="text-2xl font-black italic text-slate-700">{members.length - todayRecords.length}</span>
          <span className="text-sm italic text-slate-500">Not Marked</span>
        </div>
      </div>

      {msg.text && (
        <div className={`rounded-xl px-5 py-3 text-sm italic border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <input type="text" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-4" />
      </div>

      {/* Member list with mark buttons */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="table-th">Member</th>
                <th className="table-th">ID</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Today's Status</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const todayRecord = todayRecords.find((r) => r.member?._id === m._id);
                return (
                  <motion.tr
                    key={m._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="table-td font-semibold italic text-slate-800">{m.name}</td>
                    <td className="table-td font-mono text-xs text-slate-400">{m.memberId}</td>
                    <td className="table-td">{m.phone}</td>
                    <td className="table-td">
                      {todayRecord ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold italic ${todayRecord.status === "Present" ? "status-active" : "status-expired"}`}>
                          {todayRecord.status}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold italic bg-slate-100 text-slate-400">Not Marked</span>
                      )}
                    </td>
                    <td className="table-td">
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance(m._id, "Present")}
                          disabled={!!todayRecord}
                          className="px-3 py-1 rounded-lg text-xs font-bold italic bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(m._id, "Absent")}
                          disabled={!!todayRecord}
                          className="px-3 py-1 rounded-lg text-xs font-bold italic bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Today's full records */}
      {todayRecords.length > 0 && (
        <div>
          <h2 className="font-bold italic text-slate-700 mb-3">Today's Attendance Log</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {todayRecords.map((r) => (
              <div key={r._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm italic
                ${r.status === "Present" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <span className="text-lg">{r.status === "Present" ? "✅" : "❌"}</span>
                <div>
                  <p className="font-bold text-slate-800">{r.member?.name}</p>
                  <p className="text-xs text-slate-400">{r.member?.memberId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
