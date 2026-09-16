import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdCheckCircle, MdFitnessCenter, MdDirectionsBike, MdSportsGymnastics, MdPerson, MdSchool } from "react-icons/md";
import api from "../api/axiosConfig";

// ── Plan icon mapping ─────────────────────────────────────────────────────────
const getPlanMeta = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("cardio"))    return { icon: "🚴", color: "blue",   bg: "bg-blue-50",   border: "border-blue-200",   badge: "text-blue-700 bg-blue-100"   };
  if (n.includes("strength"))  return { icon: "💪", color: "red",    bg: "bg-red-50",    border: "border-red-200",    badge: "text-red-700 bg-red-100"     };
  if (n.includes("personal"))  return { icon: "🧑‍🤝‍🧑", color: "purple", bg: "bg-purple-50", border: "border-purple-200", badge: "text-purple-700 bg-purple-100"};
  if (n.includes("student"))   return { icon: "🎓", color: "green",  bg: "bg-green-50",  border: "border-green-200",  badge: "text-green-700 bg-green-100" };
  if (n.includes("yearly"))    return { icon: "🏆", color: "amber",  bg: "bg-amber-50",  border: "border-amber-200",  badge: "text-amber-700 bg-amber-100" };
  if (n.includes("quarterly")) return { icon: "📅", color: "amber",  bg: "bg-amber-50",  border: "border-amber-200",  badge: "text-amber-700 bg-amber-100" };
  return                               { icon: "🏋️", color: "slate",  bg: "bg-slate-50",  border: "border-slate-200",  badge: "text-slate-700 bg-slate-100" };
};

const durationTag = (days) => {
  if (days === 30)  return "Monthly";
  if (days === 90)  return "Quarterly";
  if (days === 180) return "Half-Yearly";
  if (days === 365) return "Yearly";
  return `${days}d`;
};

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = ["Personal Info", "Choose Plan", "Payment"];

export default function AddMemberPage() {
  const navigate = useNavigate();
  const [plans, setPlans]   = useState([]);
  const [step, setStep]     = useState(0); // 0 | 1 | 2
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "",
    gender: "Male", age: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payment, setPayment] = useState({ amountPaid: "", paymentMode: "Cash" });
  const [photo, setPhoto]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    api.get("/memberships").then(({ data }) => setPlans(data));
  }, []);

  const handleChange   = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePayChg   = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });
  const handlePhotoChg = (e) => {
    const f = e.target.files[0];
    setPhoto(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
  };

  const dueAmount = selectedPlan
    ? Math.max(0, selectedPlan.price - Number(payment.amountPaid || 0))
    : 0;

  const handleSubmit = async () => {
    if (!selectedPlan) { setError("Please choose a plan."); return; }
    setError(""); setLoading(true);
    try {
      if (photo) {
        // Has photo → use multipart/form-data for Cloudinary upload
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
        fd.append("planId", selectedPlan._id);
        fd.append("amountPaid", payment.amountPaid || 0);
        fd.append("paymentMode", payment.paymentMode);
        fd.append("photo", photo);
        await api.post("/members", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // No photo → send clean JSON (skips multer/Cloudinary entirely)
        await api.post("/members", {
          ...form,
          planId: selectedPlan._id,
          amountPaid: payment.amountPaid || 0,
          paymentMode: payment.paymentMode,
        });
      }
      setSuccess("Member added successfully!");
      setTimeout(() => navigate("/members"), 1600);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to add member.";
      setError(msg);
      setStep(2);
    } finally { setLoading(false); }
  };

  // Validate step 0 before moving forward
  const canNext0 = form.name.trim() && form.phone.trim();
  const canNext1 = !!selectedPlan;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
          <MdArrowBack size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic text-slate-800">Add New Member</h1>
          <p className="text-sm italic text-slate-400">Complete 3 steps to register a member</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black italic border-2 transition-all duration-300
                ${i < step  ? "bg-green-500 border-green-500 text-white"
                : i === step ? "bg-slate-800 border-slate-800 text-amber-400"
                             : "bg-white border-slate-200 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs italic mt-1 font-semibold ${i === step ? "text-slate-700" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-2 transition-all duration-500 ${i < step ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm italic text-red-600">
          ⚠️ {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm italic text-green-700 flex items-center gap-2">
          <MdCheckCircle size={20} /> {success}
        </motion.div>
      )}

      {/* ── STEP 0: Personal Info ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="card space-y-5">
              <h2 className="font-bold italic text-slate-700 text-lg border-b border-slate-100 pb-3">
                👤 Personal Information
              </h2>

              {/* Photo upload with preview */}
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden text-3xl
                  ${photoPreview ? "border-amber-300" : "border-slate-200 bg-slate-50"}`}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    : "📷"}
                </div>
                <div>
                  <p className="text-sm italic font-semibold text-slate-600 mb-1">Member Photo</p>
                  <label className="cursor-pointer inline-block px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold italic hover:bg-amber-50 hover:text-amber-700 transition">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={handlePhotoChg} className="hidden" />
                  </label>
                  <p className="text-xs italic text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Age</label>
                  <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="25" min="10" max="99" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Street, City" className="input-field" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { if (canNext0) setStep(1); else setError("Name and Phone are required."); }}
                  className="btn-primary px-8 py-2.5"
                >
                  Next → Choose Plan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Choose Plan ─────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="space-y-4">
              <div className="card">
                <h2 className="font-bold italic text-slate-700 text-lg border-b border-slate-100 pb-3 mb-4">
                  🏋️ Choose Membership Plan
                </h2>

                {plans.length === 0 ? (
                  <div className="text-center py-10 italic text-slate-400">
                    No plans available. Add plans from the Memberships page first.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map((plan) => {
                      const meta = getPlanMeta(plan.planName);
                      const isSelected = selectedPlan?._id === plan._id;
                      return (
                        <motion.div
                          key={plan._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlan(plan)}
                          className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200
                            ${isSelected
                              ? "border-slate-800 bg-slate-800 text-white shadow-lg"
                              : `${meta.bg} ${meta.border} hover:shadow-md`}`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <MdCheckCircle size={22} className="text-amber-400" />
                            </div>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{meta.icon}</span>
                            <div>
                              <p className={`font-black italic text-sm leading-tight ${isSelected ? "text-white" : "text-slate-800"}`}>
                                {plan.planName}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-amber-500 text-slate-900" : meta.badge}`}>
                                {durationTag(plan.durationInDays)}
                              </span>
                            </div>
                          </div>
                          <p className={`text-2xl font-black italic ${isSelected ? "text-amber-400" : "text-slate-800"}`}>
                            ₹{plan.price.toLocaleString("en-IN")}
                          </p>
                          <p className={`text-xs italic mt-1 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            {plan.description || `${plan.durationInDays} day access`}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-between">
                <button onClick={() => setStep(0)} className="btn-danger px-6">← Back</button>
                <button
                  onClick={() => { if (canNext1) { setError(""); setStep(2); } else setError("Please select a membership plan."); }}
                  className="btn-primary px-8"
                  disabled={!canNext1}
                >
                  Next → Payment
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Payment ─────────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="space-y-4">
              {/* Summary card */}
              <div className="card border border-slate-200">
                <h2 className="font-bold italic text-slate-700 text-lg border-b border-slate-100 pb-3 mb-4">
                  📋 Booking Summary
                </h2>
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Member summary */}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs italic font-bold text-slate-400 uppercase tracking-wider">Member</p>
                    <div className="flex items-center gap-3">
                      {photoPreview
                        ? <img src={photoPreview} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                        : <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">👤</div>
                      }
                      <div>
                        <p className="font-black italic text-slate-800">{form.name}</p>
                        <p className="text-xs italic text-slate-400">{form.phone} · {form.gender}</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan summary */}
                  {selectedPlan && (
                    <div className="flex-1 space-y-2">
                      <p className="text-xs italic font-bold text-slate-400 uppercase tracking-wider">Plan</p>
                      <div className={`rounded-xl px-4 py-3 ${getPlanMeta(selectedPlan.planName).bg} border ${getPlanMeta(selectedPlan.planName).border}`}>
                        <p className="font-black italic text-slate-800">{selectedPlan.planName}</p>
                        <p className="text-sm italic text-slate-500">₹{selectedPlan.price} · {durationTag(selectedPlan.durationInDays)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment card */}
              <div className="card border border-slate-200 space-y-4">
                <h2 className="font-bold italic text-slate-700 text-lg border-b border-slate-100 pb-3">
                  💳 Payment Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-slate-600">Amount Paying Now (₹)</label>
                    <input
                      type="number"
                      name="amountPaid"
                      value={payment.amountPaid}
                      onChange={handlePayChg}
                      placeholder="0"
                      min="0"
                      max={selectedPlan?.price}
                      className="input-field text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-600">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Cash", "UPI", "Card", "Online"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPayment({ ...payment, paymentMode: mode })}
                          className={`py-2.5 rounded-xl text-sm font-bold italic border-2 transition
                            ${payment.paymentMode === mode
                              ? "bg-slate-800 text-amber-400 border-slate-800"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
                        >
                          {mode === "Cash" ? "💵" : mode === "UPI" ? "📱" : mode === "Card" ? "💳" : "🌐"} {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Due breakdown */}
                {selectedPlan && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between italic">
                      <span className="text-slate-500">Total Fee</span>
                      <span className="font-bold text-slate-700">₹{selectedPlan.price.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between italic">
                      <span className="text-slate-500">Paying Now</span>
                      <span className="font-bold text-green-600">₹{Number(payment.amountPaid || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between italic">
                      <span className={`font-bold ${dueAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                        {dueAmount > 0 ? "Due Amount" : "✅ Fully Paid"}
                      </span>
                      <span className={`font-black text-lg ${dueAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                        ₹{dueAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-between">
                <button onClick={() => setStep(1)} className="btn-danger px-6">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !!success}
                  className="btn-gold px-10 py-3 text-base disabled:opacity-60"
                >
                  {loading ? "Adding Member..." : "✓ Confirm & Add Member"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
