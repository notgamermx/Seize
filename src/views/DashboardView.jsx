import React from 'react';
import { Activity, Shield, Zap, Heart, Flame, Clock } from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar';
import StatCard from '../components/common/StatCard';

const DashboardView = ({ userData }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {/* Header Status */}
    <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Shield size={180} />
      </div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500 rounded-full blur-[100px] opacity-20"></div>
      
      <div className="relative z-10">
        <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={14}/> Current Status</h2>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8 shadow-black/50 drop-shadow-md">Fitness Overview</h1>
        
        <div className="max-w-2xl bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <ProgressBar value={userData.stamina} color="bg-rose-500" label="Stamina Capacity" icon={Heart} />
          <ProgressBar value={userData.energy} color="bg-cyan-400" label="Energy Levels" icon={Zap} />
        </div>
      </div>
    </div>

    {/* Quick Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Steps" value={userData.stats.steps} icon={Activity} />
      <StatCard label="Calories" value={userData.stats.cals} icon={Flame} />
      <StatCard label="Active Time" value={userData.stats.activeTime} icon={Clock} />
      <StatCard label="Avg BPM" value={userData.stats.bpm} icon={Heart} />
    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Missions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl col-span-1">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Activity size={16} className="text-fuchsia-400" /> Daily Priorities
        </h3>
        <div className="space-y-3">
          <div className="text-sm text-zinc-500 font-medium p-8 text-center border border-dashed border-white/10 rounded-2xl bg-black/10">
            No active targets set
          </div>
        </div>
      </div>

      {/* Active Raids */}
      <div className="col-span-1 lg:col-span-2 space-y-4">
         <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" /> Focus Sessions
        </h3>
        <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/5 border border-white/10 rounded-3xl p-8 shadow-xl flex items-center justify-center min-h-[160px]">
          <div className="text-sm text-zinc-400 font-medium text-center">
            Your recommended workouts will appear here
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardView;
