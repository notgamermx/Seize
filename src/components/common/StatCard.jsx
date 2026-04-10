import React from 'react';
import { Activity } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex flex-col justify-between shadow-xl shadow-black/20 hover:bg-white/10 transition-all duration-300 group">
    <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3 flex justify-between items-start">
      <span>{label}</span>
      <div className="p-2 bg-black/20 rounded-xl group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300"><Icon size={16} className="text-zinc-300 group-hover:text-violet-300" /></div>
    </div>
    <div className="text-3xl font-black text-white tracking-tight">{value}</div>
    {trend && <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1"><Activity size={12} /> {trend}</div>}
  </div>
);

export default StatCard;
