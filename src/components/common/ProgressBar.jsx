import React from 'react';
import { Heart } from 'lucide-react';

const ProgressBar = ({ value, color, label, icon: Icon, subLabel }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-medium uppercase tracking-wider mb-2 text-zinc-400">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className={color.replace('bg-', 'text-').split(' ')[0]} />}
        <span>{label}</span>
      </div>
      <span className="font-bold text-white">{subLabel || `${value}%`}</span>
    </div>
    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
        style={{ width: `${value}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 mix-blend-overlay"></div>
      </div>
    </div>
  </div>
);

export default ProgressBar;
