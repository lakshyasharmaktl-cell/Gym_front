import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdEdit, MdDelete, MdClose, MdAutoAwesome } from "react-icons/md";
import api from "../api/axiosConfig";

const DEFAULT_PLANS = [
  { planName: "Full Gym — Monthly",          durationInDays: 30,  price: 1500,  description: "Full access to gym equipment, weights, cardio & group classes" },
  { planName: "Full Gym — Quarterly",        durationInDays: 90,  price: 4000,  description: "3-month full gym access with 11% savings" },
  { planName: "Full Gym — Half Yearly",      durationInDays: 180, price: 7500,  description: "6-month full gym access with 17% savings" },
  { planName: "Full Gym — Yearly",           durationInDays: 365, price: 12000, description: "Annual full gym membership with maximum savings" },
  { planName: "Cardio Only — Monthly",       durationInDays: 30,  price: 800,   description: "Access to treadmills, cycles, elliptical & cardio equipment" },
  { planName: "Strength Training — Monthly", durationInDays: 30,  price: 1200,  description: "Access to free weights, machines & strength equipment" },
  { planName: "Personal Training — Monthly", durationInDays: 30,  price: 3500,  description: "1-on-1 personal trainer sessions, 12 sessions/month" },
  { planName: "Student Plan — Monthly",      durationInDays: 30,  price: 600,   description: "Discounted full gym access for students (ID required)" },
];

const emptyForm = { planName: "", durationInDays: "", price: "", description: "" };

export default function MembershipsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const fetchPlans = () => {
    setLoading(true);
    api.get("/memberships").then(({ data }) => setPlans(data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPlans(); }, []);

  const openAdd = () => { setEditingPlan(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({ planName: plan.planName, durationInDays: plan.durationInDays, price: plan.price, description: plan.description || "" });
    setShowModal(true);
  };

  const loadDefaultPlans = async () => {
    if (!window.confirm("This will add 8 default gym plans. Continue?")) return;
    try {
      await Promise.all(DEFAULT_PLANS.map((p) => api.post("/memberships", p)));
      showMsg("8 default plans loaded successfully!");
      fetchPlans();
    } catch (err) { showMsg("Failed to load default plans.", "error"); }
  };

  const showMsg = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/memberships/${editingPlan._id}`, form);
        showMsg("Plan updated successfully!");
      } else {
        await api.post("/memberships", form);
        showMsg("Plan created successfully!");
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) { showMsg(err.response?.data?.message || "Operation failed.", "error"); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    try {
      await api.delete(`/memberships/${id}`);
      showMsg("Plan deleted.");
      fetchPlans();
    } catch (err) { showMsg("Delete failed.", "error"); }
  };

  const durationLabel = (days) => {
    if (days === 30) return "Monthly";
    if (days === 90) return "Quarterly";
    if (days === 180) return "Half-Yearly";
    if (days === 365) return "Yearly";
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black italic text-slate-800">Membership Plans</h1>
          <p className="text-sm italic text-slate-400 mt-1">Manage all gym membership plans</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {plans.length === 0 && (
            <button onClick={loadDefaultPlans} className="btn-primary inline-flex items-center gap-2 text-amber-400">
              <MdAutoAwesome size={18} /> Load Default Plans
            </button>
          )}
          <button onClick={openAdd} className="btn-gold inline-flex items-center gap-2">
            <MdAdd size={20} /> New Plan
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`rounded-xl px-5 py-3 text-sm italic border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-700"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
        </div>
      ) : plans.length === 0 ? (
        <div className="card text-center italic text-slate-400 py-16">
          No membership plans yet. Create your first plan!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card border border-slate-200 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black italic text-slate-800">{plan.planName}</h3>
                  <span className="inline-block text-xs italic font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 mt-1">
                    {durationLabel(plan.durationInDays)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition">
                    <MdEdit size={17} />
                  </button>
                  <button onClick={() => handleDelete(plan._id, plan.planName)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition">
                    <MdDelete size={17} />
                  </button>
                </div>
              </div>
              <div className="text-3xl font-black italic text-slate-800">
                ₹{plan.price}
                <span className="text-sm font-normal text-slate-400 ml-1">/ {plan.durationInDays} days</span>
              </div>
              {plan.description && (
                <p className="text-sm italic text-slate-400">{plan.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold italic text-slate-800">
                  {editingPlan ? "Edit Plan" : "New Membership Plan"}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                  <MdClose size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Plan Name *</label>
                  <input value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} required placeholder="Monthly, Quarterly..." className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Duration (days) *</label>
                  <input type="number" value={form.durationInDays} onChange={(e) => setForm({ ...form, durationInDays: e.target.value })} required placeholder="30" min="1" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="999" min="0" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." className="input-field" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="btn-primary flex-1">
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-danger">Cancel</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
