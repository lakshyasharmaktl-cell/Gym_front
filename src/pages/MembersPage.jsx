import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdSearch, MdPersonAdd, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import api from "../api/axiosConfig";

const StatusBadge = ({ status }) => {
  const cls =
    status === "Active" ? "status-active" :
    status === "Pending" ? "status-pending" :
    "status-expired";
  return (
    <span className={`${cls} px-2.5 py-0.5 rounded-full text-xs font-bold italic`}>
      {status}
    </span>
  );
};

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMembers = () => {
    setLoading(true);
    api.get("/members")
      .then(({ data }) => setMembers(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member "${name}"?`)) return;
    await api.delete(`/members/${id}`);
    fetchMembers();
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black italic text-slate-800">Members</h1>
          <p className="text-sm italic text-slate-400 mt-1">{members.length} total members registered</p>
        </div>
        <Link to="/members/add" className="btn-gold inline-flex items-center gap-2">
          <MdPersonAdd size={18} /> Add Member
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center italic text-slate-400 py-16 text-sm">
            No members found.
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="table-th">Member ID</th>
                <th className="table-th">Name</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Plan</th>
                <th className="table-th">Due (₹)</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={m._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="table-td font-mono text-xs text-slate-500">{m.memberId}</td>
                  <td className="table-td font-semibold italic text-slate-800">{m.name}</td>
                  <td className="table-td">{m.phone}</td>
                  <td className="table-td">{m.membership?.plan?.planName || "—"}</td>
                  <td className="table-td text-red-600 font-bold">
                    {m.membership?.dueAmount > 0 ? `₹${m.membership.dueAmount}` : "—"}
                  </td>
                  <td className="table-td">
                    <StatusBadge status={m.membership?.status || "—"} />
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/members/${m._id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="View"
                      >
                        <MdVisibility size={17} />
                      </button>
                      <button
                        onClick={() => navigate(`/members/${m._id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition"
                        title="Edit"
                      >
                        <MdEdit size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <MdDelete size={17} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
