import React from 'react';
import { Activity, Heart, Clock, Dumbbell } from 'lucide-react';

const HistoryView = ({ recentLogs }) => {
  const workoutCategories = [
    { title: "Strength Training", icon: Dumbbell, count: "24 Exercises", color: "text-rose-400", bg: "bg-gradient-to-br from-rose-500/10 to-transparent", hover: "hover:border-rose-400" },
    { title: "Cardio", icon: Activity, count: "12 Exercises", color: "text-cyan-400", bg: "bg-gradient-to-br from-cyan-500/10 to-transparent", hover: "hover:border-cyan-400" },
    { title: "Flexibility & Core", icon: Heart, count: "18 Exercises", color: "text-emerald-400", bg: "bg-gradient-to-br from-emerald-500/10 to-transparent", hover: "hover:border-emerald-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Standard Fitness</h2>
          <h1 className="text-4xl font-black text-white px-0 tracking-tight drop-shadow-md">Exercise Library</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workoutCategories.map((cat, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-white/5 ${cat.bg} cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10`}>
                  <cat.icon size={24} className={cat.color} />
              </div>
              <h3 className={`font-black uppercase tracking-wide text-white`}>{cat.title}</h3>
            </div>
            <p className="text-sm text-zinc-400 font-medium">{cat.count} available</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-5 flex items-center gap-2"><Clock size={16} /> Recent Standard Logs</h3>
        <div className="space-y-3">
          {recentLogs.length === 0 && <div className="text-sm text-zinc-500 italic p-6 text-center bg-black/20 rounded-2xl border border-white/5">No logs available. Go to Live Workout to start.</div>}
          {recentLogs.map((log, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-black/20 hover:bg-black/40 transition-colors border border-white/5 rounded-2xl gap-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Dumbbell size={20} className="text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{log.name}</h4>
                  <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{log.type} • {log.date}</div>
                </div>
              </div>
              <div className="flex gap-6 text-center sm:text-right">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Sets</div>
                  <div className="font-mono text-sm text-zinc-300 bg-white/5 px-2 rounded-md">{log.sets}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Reps</div>
                  <div className="font-mono text-sm text-zinc-300 bg-white/5 px-2 rounded-md">{log.reps}</div>
                </div>
                <div>
                  <div className="text-[10px] text-violet-400 uppercase font-black tracking-widest mb-1">Weight</div>
                  <div className="font-mono text-sm text-fuchsia-400 bg-fuchsia-500/10 px-2 rounded-md border border-fuchsia-500/20">{log.weight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
