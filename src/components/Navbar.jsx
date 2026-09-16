import React from "react";
import { MdMenu } from "react-icons/md";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 shadow-sm z-10 flex items-center px-4">
      {/* Left: hamburger (mobile) */}
      <div className="flex items-center lg:w-64">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <MdMenu size={24} />
        </button>
      </div>

      {/* Center: GYM CENTER brand (absolute center) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none">
        <span className="gym-brand text-2xl text-slate-800 tracking-widest">
          🏋️ GYM CENTER
        </span>
        <span className="text-[10px] italic text-amber-500 font-semibold tracking-[0.2em] -mt-1">
          ADMIN PANEL
        </span>
      </div>

      {/* Right: date */}
      <div className="ml-auto text-xs italic text-slate-400 hidden sm:block">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </header>
  );
};

export default Navbar;
