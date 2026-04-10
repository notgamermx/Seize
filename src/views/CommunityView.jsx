import React from 'react';
import { Users } from 'lucide-react';

const CommunityView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[200px] flex items-center p-6 sm:p-10">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-slate-700 to-slate-900 mix-blend-screen"></div>
      <div className="absolute left-0 top-0 bottom-0 w-32 flex justify-around opacity-5">
        {[...Array(5)].map((_,i) => <div key={i} className="w-1 bg-white h-full"></div>)}
      </div>
      <div className="relative z-10 max-w-xl">
        <div className="inline-block bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users size={14} /> Independent
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-500 uppercase tracking-tight mb-2 shadow-sm">No Community</h1>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">Join a community to participate in team challenges and climb the global rankings.</p>
      </div>
      <div className="absolute right-6 sm:right-10 top-10 text-right">
        <div className="text-3xl sm:text-5xl font-black text-slate-700">0</div>
        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Group Points</div>
      </div>
    </div>
  </div>
);

export default CommunityView;
