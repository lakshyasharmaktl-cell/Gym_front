import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color = "slate", sub }) => {
  const colorMap = {
    slate:  { bg: "bg-slate-50",  icon: "text-slate-600",  border: "border-slate-200" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-200" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  border: "border-amber-200" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    border: "border-red-200"   },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-200"  },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200"},
  };

  const c = colorMap[color] || colorMap.slate;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`card border ${c.border} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold italic uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <span className={`text-2xl ${c.icon}`}>{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-black italic text-slate-800">{value ?? "—"}</p>
        {sub && <p className="text-xs italic text-slate-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
