import React, { useState } from 'react';
import { Activity, Zap, Heart, Flame, Dumbbell } from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar';
import StatCard from '../components/common/StatCard';

const WorkoutView = ({ activeSession, setActiveSession, finishSession, activityLogs }) => {
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);

  const availableTasks = [
    { id: 'pushups', name: 'Pushups', type: 'Strength', icon: Activity },
    { id: 'running', name: 'Running', type: 'Cardio', icon: Zap },
    { id: 'planks', name: 'Planks', type: 'Core', icon: Heart },
    { id: 'squats', name: 'Squats', type: 'Strength', icon: Dumbbell }
  ];

  const startSession = (task) => {
    setActiveSession({
      ...task,
      startTime: Date.now(),
      elapsed: 0,
      sets: [],
      isActive: true
    });
    setReps(0);
    setWeight(0);
  };

  const logSet = () => {
    if (!activeSession) return;
    const newSet = { reps, weight, time: activeSession.elapsed };
    setActiveSession(prev => ({
      ...prev,
      sets: [...prev.sets, newSet]
    }));
    setReps(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      {/* Raid Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-end gap-4 shadow-lg shadow-black/50">
        <div className="w-full md:w-2/3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {activeSession ? `Current Task: ${activeSession.type}` : "Target Intensity: --"}
            </span>
            <span className="text-xs font-mono text-slate-600">
              {activeSession ? `${Math.floor(activeSession.elapsed / 60).toString().padStart(2, '0')}:${(activeSession.elapsed % 60).toString().padStart(2, '0')}` : "00:00"}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-600 uppercase tracking-tight mb-4 shadow-sm">
            {activeSession ? activeSession.name : "No Active Workout"}
          </h1>
          <ProgressBar 
            value={activeSession ? Math.min(100, (activeSession.sets.length / 5) * 100) : 0} 
            color="bg-cyan-500 shadow-cyan-500/50" 
            label="Completion" 
            subLabel={activeSession ? `${activeSession.sets.length} Sets` : "0 / 0 (0%)"} 
          />
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center min-w-[150px]">
          <div className="text-xs text-slate-500 font-bold uppercase mb-1">Sets Logged</div>
          <div className="text-3xl font-black text-cyan-400">{activeSession ? activeSession.sets.length : 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Action Panel */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-end">
          
          {/* Realtime Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Heart Rate" value="--" trend="BPM" icon={Heart} />
            <StatCard label="Calories" value={activeSession ? Math.floor(activeSession.elapsed * 0.15) : 0} trend="KCAL" icon={Flame} />
            <StatCard label="Power" value="--" trend="WATTS" icon={Zap} />
          </div>

          {/* Input Panel */}
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-xl">
            {activeSession ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-cyan-500 border border-slate-700">
                      <activeSession.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white uppercase">{activeSession.name}</h3>
                      <p className="text-xs text-cyan-400 animate-pulse">Session Active...</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyan-500">SET {activeSession.sets.length + 1}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 bg-slate-950 rounded-xl p-4 text-center border border-slate-800 flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-bold uppercase mb-2">Reps Complete</span>
                    <div className="flex justify-center items-center gap-4">
                      <button onClick={() => setReps(r => Math.max(0, r - 1))} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">-</button>
                      <span className="text-4xl font-black text-white w-16">{reps}</span>
                      <button onClick={() => setReps(r => r + 1)} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">+</button>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-950 rounded-xl p-4 text-center border border-slate-800 flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-bold uppercase mb-2">Weight Load</span>
                    <div className="flex justify-center items-center gap-4">
                      <button onClick={() => setWeight(w => Math.max(0, w - 5))} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">-</button>
                      <span className="text-4xl font-black text-white w-16">{weight}</span>
                      <button onClick={() => setWeight(w => w + 5)} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={logSet}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-wider rounded-xl transition-all py-4 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Log Set
                  </button>
                  <button 
                    onClick={finishSession}
                    className="flex-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black uppercase tracking-wider rounded-xl transition-all px-8 border border-rose-500/50">
                    Finish
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-500 border border-slate-700">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-400 uppercase">Select an Exercise</h3>
                      <p className="text-xs text-slate-600">Choose a task to begin logging...</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {availableTasks.map(task => (
                    <button 
                      key={task.id} 
                      onClick={() => startSession(task)}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group">
                      <task.icon size={24} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase">{task.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Combat Log */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col h-[300px] lg:h-auto">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Activity Log</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar font-mono text-[11px] sm:text-xs">
            {activityLogs.length === 0 ? (
              <div className="text-slate-600 italic">No recent workout activity.</div>
            ) : (
              [...activityLogs].reverse().map((log, i) => (
                <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2">
                  <span className="text-slate-600 mr-2">[{log.time}]</span>
                  <span className={log.highlight ? 'text-cyan-400 font-bold' : ''}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutView;
