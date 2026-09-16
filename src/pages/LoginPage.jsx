import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", form);
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
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

        {/* Login card */}
        <div className="card border border-slate-200">
          <h2 className="text-xl font-bold italic text-slate-700 mb-6">
            Sign in to continue
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm italic text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Link to register */}
          <div className="mt-5 text-center">
            <p className="text-sm italic text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-amber-600 font-bold italic hover:text-amber-700 underline underline-offset-2 transition"
              >
                Register here
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
