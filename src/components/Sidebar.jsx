import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdDashboard,
  MdPeople,
  MdCardMembership,
  MdPayment,
  MdToday,
  MdWarning,
  MdMenu,
  MdClose,
} from "react-icons/md";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
  { to: "/members", label: "Members", icon: <MdPeople size={20} /> },
  { to: "/memberships", label: "Memberships", icon: <MdCardMembership size={20} /> },
  { to: "/payments", label: "Payments", icon: <MdPayment size={20} /> },
  { to: "/attendance", label: "Attendance", icon: <MdToday size={20} /> },
  { to: "/dues", label: "Dues", icon: <MdWarning size={20} /> },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-xl z-30 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 italic">Admin Panel</p>
            <p className="text-sm font-bold italic text-slate-700 mt-0.5">
              {admin?.name || "Admin"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
