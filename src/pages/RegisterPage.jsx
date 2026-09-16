import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess("Admin registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏋️</div>
          <h1 className="text-4xl font-black italic text-slate-800 tracking-widest">
            GYM CENTER
          </h1>
          <p className="text-sm italic text-amber-500 font-semibold tracking-[0.25em] mt-1">
            ADMIN PANEL
          </p>
        </div>

        {/* Register card */}
        <div className="card border border-slate-200">
          <h2 className="text-xl font-bold italic text-slate-700 mb-1">
            Create Admin Account
          </h2>
          <p className="text-xs italic text-slate-400 mb-6">
            Register a new administrator for GYM CENTER
          </p>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm italic text-red-600"
            >
              ⚠️ {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm italic text-green-700"
            >
              ✅ {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Admin Name"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@gymcenter.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-600">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 text-base mt-2 disabled:opacity-60"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          {/* Link to login */}
          <div className="mt-5 text-center">
            <p className="text-sm italic text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-slate-700 font-bold italic hover:text-amber-600 underline underline-offset-2 transition"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs italic text-slate-400 mt-6">
          © 2026 GYM CENTER · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
