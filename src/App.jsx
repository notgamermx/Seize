import React, { useState, useEffect } from 'react';
import { 
  Activity, Map as MapIcon, Users, Shield, 
  Zap, ChevronRight, Dumbbell
} from 'lucide-react';

// --- Modularized Components & Views ---
import ProgressBar from './components/common/ProgressBar';
import StatCard from './components/common/StatCard';
import AuthView from './components/auth/AuthView';
import DashboardView from './views/DashboardView';
import WorkoutView from './views/WorkoutView';
import HistoryView from './views/HistoryView';
import MapView from './views/MapView';
import CommunityView from './views/CommunityView';

// --- Main Layout ---

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('seize_token') || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App-wide state
  const [userData, setUserData] = useState({
    name: "New Athlete",
    level: 1,
    tier: "Beginner",
    stamina: 80,
    energy: 100,
    score: 0,
    nextScore: 1000,
    stats: { steps: "4,200", cals: "350", activeTime: "45m", bpm: "112" }
  });

  const [activeSession, setActiveSession] = useState(null);
  const [activityLogs, setActivityLogs] = useState([
    { time: "12:00 PM", message: "System Initialized", highlight: false }
  ]);
  const [recentLogs, setRecentLogs] = useState([
    { name: "Barbell Bench Press", type: "Strength", sets: "4 Sets", reps: "8-12 Reps", weight: "135 lbs", date: "Yesterday" }
  ]);

  // Session timer hook
  useEffect(() => {
    let interval;
    if (activeSession && activeSession.isActive) {
      interval = setInterval(() => {
        setActiveSession(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.isActive]);

  const finishSession = () => {
    if (!activeSession) return;
    
    // Add to logs
    const totalReps = activeSession.sets.reduce((sum, s) => sum + s.reps, 0);
    const maxWeight = activeSession.sets.reduce((max, s) => Math.max(max, s.weight), 0);
    
    setRecentLogs(prev => [
      {
        name: activeSession.name,
        type: activeSession.type,
        sets: `${activeSession.sets.length} Sets`,
        reps: `${totalReps} Total Reps`,
        weight: `${maxWeight} lbs max`,
        date: "Just Now"
      },
      ...prev
    ]);

    setActivityLogs(prev => [
      ...prev,
      { 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        message: `Completed ${activeSession.name} (${activeSession.sets.length} sets)`, 
        highlight: true 
      }
    ]);

    // Update user stats slightly
    setUserData(prev => ({
      ...prev,
      stamina: Math.max(0, prev.stamina - (activeSession.sets.length * 5)),
      stats: {
        ...prev.stats,
        cals: (parseInt(prev.stats.cals.replace(',','')) + Math.floor(activeSession.elapsed * 0.15)).toString()
      }
    }));

    setActiveSession(null);
    setActiveTab('dashboard'); // Redirect to dashboard optionally to see stats
  };

  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'standard', icon: Dumbbell, label: 'History' },
    { id: 'workout', icon: Zap, label: 'Live Workout' },
    { id: 'route', icon: MapIcon, label: 'Area Tracker' },
    { id: 'community', icon: Users, label: 'Community' },
  ];

  const handleLogin = (newToken, userPayload) => {
     localStorage.setItem('seize_token', newToken);
     setUserData(prev => ({ ...prev, name: userPayload.username }));
     setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('seize_token');
    setToken(null);
  };

  if (!token) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-violet-500/30 flex flex-col md:flex-row overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        @keyframes dash { to { stroke-dashoffset: -100; } }
      `}} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white/[0.02] backdrop-blur-3xl border-r border-white/5 flex-col justify-between z-20 shadow-2xl">
        <div>
          <div className="p-8">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 uppercase drop-shadow-md">
              Seize
            </h1>
          </div>

          <div className="px-6 mb-8">
            <div className="bg-black/20 border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors shadow-inner">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-violet-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#09090b]"></div>
              </div>
              <div>
                <div className="text-sm font-bold text-white truncate w-28">{userData.name}</div>
                <div className="text-[10px] text-fuchsia-400 uppercase font-black tracking-wider">Lvl {userData.level} {userData.tier}</div>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-violet-400' : 'text-zinc-600'} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-8">
          <button 
             onClick={() => setActiveTab('workout')}
             className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black uppercase text-sm py-4 rounded-2xl transition-all shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1">
            Quick Start
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="md:hidden flex items-center justify-between p-6 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 z-20 fixed top-0 w-full">
            <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 uppercase">
              Seize
            </h1>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center hover:bg-violet-500/20 transition-colors">
                <Shield size={20} className="text-violet-400" />
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pt-24 md:pt-8 md:p-8 custom-scrollbar pb-32 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardView userData={userData} />}
            {activeTab === 'standard' && <HistoryView recentLogs={recentLogs} />}
            {activeTab === 'workout' && (
              <WorkoutView 
                activeSession={activeSession} 
                setActiveSession={setActiveSession} 
                finishSession={finishSession}
                activityLogs={activityLogs}
              />
            )}
            {activeTab === 'community' && <CommunityView />}
            {activeTab === 'route' && <MapView />}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-black/60 backdrop-blur-3xl border border-white/10 flex justify-around items-center p-2 rounded-3xl shadow-2xl z-30">
         {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 min-w-[64px] rounded-2xl transition-all duration-300 ${
                  isActive ? 'text-violet-300 transform -translate-y-1' : 'text-zinc-500'
                }`}
              >
                <div className={`p-2.5 rounded-xl mb-1 ${isActive ? 'bg-violet-500/20 shadow-inner border border-violet-500/30' : 'bg-transparent'}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            )
          })}
      </nav>

      {activeSession && (
          <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-rose-500 text-white rounded-full p-2 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)] z-40">
             <Heart size={20} />
          </div>
      )}

    </div>
  );
}