import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowBack, MdEdit, MdRefresh, MdPayment } from "react-icons/md";
import api from "../api/axiosConfig";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

const StatusBadge = ({ status }) => {
  const cls =
    status === "Active" ? "status-active" :
    status === "Pending" ? "status-pending" : "status-expired";
  return <span className={`${cls} px-3 py-1 rounded-full text-xs font-bold italic`}>{status}</span>;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info"); // info | renew | pay | payments

  // Edit form state
  const [editForm, setEditForm] = useState({});
  const [renewForm, setRenewForm] = useState({ planId: "", amountPaid: "", paymentMode: "Cash" });
  const [payForm, setPayForm] = useState({ amount: "", paymentMode: "Cash", note: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [m, p, py] = await Promise.all([
        api.get(`/members/${id}`),
        api.get("/memberships"),
        api.get(`/payments/${id}`),
      ]);
      setMember(m.data);
      setEditForm({ name: m.data.name, phone: m.data.phone, email: m.data.email || "", address: m.data.address || "", gender: m.data.gender || "Male", age: m.data.age || "" });
      setPlans(p.data);
      setPayments(py.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${id}`, editForm);
      showMsg("Member updated successfully!");
      load();
    } catch (err) { showMsg(err.response?.data?.message || "Update failed.", "error"); }
  };

  const handleRenew = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${id}/renew`, renewForm);
      showMsg("Membership renewed!");
      setTab("info"); load();
    } catch (err) { showMsg(err.response?.data?.message || "Renewal failed.", "error"); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/payments/${id}`, payForm);
      showMsg("Payment recorded!");
      setPayForm({ amount: "", paymentMode: "Cash", note: "" });
      setTab("payments"); load();
    } catch (err) { showMsg(err.response?.data?.message || "Payment failed.", "error"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent" />
    </div>
  );
  if (!member) return <div className="italic text-slate-400 text-center py-20">Member not found.</div>;

  const ms = member.membership;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <MdArrowBack size={22} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black italic text-slate-800">{member.name}</h1>
            <StatusBadge status={ms?.status || "—"} />
          </div>
          <p className="text-sm italic text-slate-400 font-mono mt-1">ID: {member.memberId}</p>
        </div>
        {member.photo && (
          <img src={member.photo} alt="photo" className="w-14 h-14 rounded-full object-cover border-2 border-amber-300" />
        )}
      </div>

      {/* Alert msg */}
      {msg.text && (
        <div className={`rounded-xl px-5 py-3 text-sm italic border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: "info", label: "Info", icon: <MdEdit size={16}/> },
          { key: "renew", label: "Renew", icon: <MdRefresh size={16}/> },
          { key: "pay", label: "Pay Due", icon: <MdPayment size={16}/> },
          { key: "payments", label: "History", icon: <MdPayment size={16}/> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold italic transition
              ${tab === t.key ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* ── INFO / EDIT TAB ── */}
        {tab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Details card */}
            <div className="card space-y-3">
              <h2 className="font-bold italic text-slate-700 border-b border-slate-100 pb-2">Personal Details</h2>
              {[
                ["Phone", member.phone],
                ["Email", member.email || "—"],
                ["Gender", member.gender || "—"],
                ["Age", member.age ? `${member.age} yrs` : "—"],
                ["Address", member.address || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="italic text-slate-400">{k}</span>
                  <span className="font-semibold text-slate-700">{v}</span>
                </div>
              ))}
            </div>
            {/* Membership card */}
            <div className="card space-y-3">
              <h2 className="font-bold italic text-slate-700 border-b border-slate-100 pb-2">Membership</h2>
              {[
                ["Plan", ms?.plan?.planName || "—"],
                ["Start Date", fmtDate(ms?.startDate)],
                ["End Date", fmtDate(ms?.endDate)],
                ["Total Fee", fmt(ms?.totalFee)],
                ["Amount Paid", fmt(ms?.amountPaid)],
                ["Due Amount", fmt(ms?.dueAmount)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="italic text-slate-400">{k}</span>
                  <span className={`font-semibold ${k === "Due Amount" && ms?.dueAmount > 0 ? "text-red-600" : "text-slate-700"}`}>{v}</span>
                </div>
              ))}
            </div>
            {/* Edit form */}
            <form onSubmit={handleEdit} className="card md:col-span-2 space-y-4">
              <h2 className="font-bold italic text-slate-700 border-b border-slate-100 pb-2">Edit Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[["name","Full Name"],["phone","Phone"],["email","Email"],["address","Address"]].map(([n, l]) => (
                  <div key={n}>
                    <label className="block text-sm mb-1 text-slate-600">{l}</label>
                    <input name={n} value={editForm[n] || ""} onChange={(e) => setEditForm({ ...editForm, [n]: e.target.value })} className="input-field" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Gender</label>
                  <select name="gender" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="input-field">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Age</label>
                  <input type="number" name="age" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} className="input-field" />
                </div>
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </div>
        )}

        {/* ── RENEW TAB ── */}
        {tab === "renew" && (
          <form onSubmit={handleRenew} className="card space-y-4 max-w-lg">
            <h2 className="font-bold italic text-slate-700 border-b border-slate-100 pb-2">Renew Membership</h2>
            <div>
              <label className="block text-sm mb-1 text-slate-600">New Plan *</label>
              <select name="planId" value={renewForm.planId} onChange={(e) => setRenewForm({ ...renewForm, planId: e.target.value })} required className="input-field">
                <option value="">— Select Plan —</option>
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>{p.planName} — ₹{p.price} / {p.durationInDays} days</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-600">Amount Paid (₹)</label>
              <input type="number" value={renewForm.amountPaid} onChange={(e) => setRenewForm({ ...renewForm, amountPaid: e.target.value })} placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-600">Payment Mode</label>
              <select value={renewForm.paymentMode} onChange={(e) => setRenewForm({ ...renewForm, paymentMode: e.target.value })} className="input-field">
                <option>Cash</option><option>Online</option><option>Card</option><option>UPI</option>
              </select>
            </div>
            <button type="submit" className="btn-gold">Renew Membership</button>
          </form>
        )}

        {/* ── PAY DUE TAB ── */}
        {tab === "pay" && (
          <div className="card space-y-4 max-w-lg">
            <h2 className="font-bold italic text-slate-700 border-b border-slate-100 pb-2">
              Collect Payment
            </h2>

            {/* DUES CLEARED — block form */}
            {(!ms?.dueAmount || ms.dueAmount <= 0) ? (
              <div className="flex flex-col items-center py-8 text-center space-y-3">
                <span className="text-5xl">✅</span>
                <p className="text-lg font-black italic text-green-700">Dues Fully Cleared!</p>
                <p className="text-sm italic text-slate-400">
                  {member.name} has no outstanding balance.<br />
                  Total paid: <span className="font-bold text-slate-700">{fmt(ms?.amountPaid)}</span>
                </p>
                <button type="button" onClick={() => setTab("renew")} className="btn-gold mt-2">
                  Renew Membership Instead
                </button>
              </div>
            ) : (
              /* FORM — only shown when due > 0 */
              <form onSubmit={handlePayment} className="space-y-4">
                {/* Due banner */}
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-sm italic text-red-600 font-semibold">Outstanding Due</span>
                  <span className="text-2xl font-black italic text-red-600">{fmt(ms.dueAmount)}</span>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-600">Amount Collecting Now (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payForm.amount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                    placeholder="0"
                    max={ms.dueAmount}
                    min="1"
                    className="input-field text-lg font-bold"
                  />
                  {Number(payForm.amount) > ms.dueAmount && (
                    <p className="text-xs italic text-amber-600 mt-1">⚠️ Cannot exceed due: {fmt(ms.dueAmount)}</p>
                  )}
                </div>

                {/* Payment mode buttons */}
                <div>
                  <label className="block text-sm mb-2 text-slate-600">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ mode: "Cash", emoji: "💵" }, { mode: "UPI", emoji: "📱" }, { mode: "Card", emoji: "💳" }, { mode: "Online", emoji: "🌐" }].map(({ mode, emoji }) => (
                      <button key={mode} type="button"
                        onClick={() => setPayForm({ ...payForm, paymentMode: mode })}
                        className={`py-2.5 rounded-xl text-sm font-bold italic border-2 transition
                          ${payForm.paymentMode === mode ? "bg-slate-800 text-amber-400 border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                        {emoji}<br />{mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-600">Note (optional)</label>
                  <input value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} placeholder="e.g. Partial payment" className="input-field" />
                </div>

                <button type="submit"
                  disabled={!payForm.amount || Number(payForm.amount) <= 0 || Number(payForm.amount) > ms.dueAmount}
                  className="btn-gold w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  💰 Collect {payForm.amount ? fmt(payForm.amount) : "Payment"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── PAYMENT HISTORY TAB ── */}
        {tab === "payments" && (
          <div className="card p-0 overflow-x-auto">
            {payments.length === 0 ? (
              <p className="italic text-slate-400 text-center py-12 text-sm">No payments recorded yet.</p>
            ) : (
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="table-th">Date</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Mode</th>
                    <th className="table-th">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="table-td">{fmtDate(p.paymentDate)}</td>
                      <td className="table-td font-bold text-green-600">{fmt(p.amount)}</td>
                      <td className="table-td">{p.paymentMode}</td>
                      <td className="table-td italic text-slate-400">{p.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
