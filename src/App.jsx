import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Map as MapIcon, Users, Sword, Shield, 
  Zap, Heart, Play, Square, Plus, ChevronRight, CheckCircle2,
  Trophy, Crosshair, Flame, Clock, Dumbbell, X
} from 'lucide-react';
import * as turf from '@turf/turf';

// --- Sub-Components ---

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

// --- Main Views ---

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

const CommunityView = () => (
  // ... (leaving community untouched but using mock for visually full layout) ...
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

const StandardWorkoutView = ({ recentLogs }) => {
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

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef(null);
  const polygonRef = useRef(null);
  const trackPathRef = useRef([]); // Stores all lat lng pairs [lng, lat] for turf
  
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [distance, setDistance] = useState(0); // in km
  const [areaCaptured, setAreaCaptured] = useState(0); // in sq meters
  const [time, setTime] = useState(0);

  // Timer logic
  useEffect(() => {
     let interval;
     if (isTracking) {
        interval = setInterval(() => setTime(t => t + 1), 1000);
     }
     return () => clearInterval(interval);
  }, [isTracking]);

  // Area calculation via Turf
  const calculateArea = (latlngs) => {
    if (latlngs.length < 3) return 0;
    try {
      // Create a closed polygon loop by copying the first coord to the end
      const coords = latlngs.map(ll => [ll.lng, ll.lat]);
      const closedCoords = [...coords, coords[0]];
      const poly = turf.polygon([closedCoords]);
      const area = turf.area(poly); // gets area in square meters
      return area;
    } catch (e) {
      console.error("Area calc failed:", e);
      return 0;
    }
  };

  // Map initialization & Leaflet Script Loading
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapRef.current && !mapInstanceRef.current && window.L) {
        const L = window.L;
        const fallbackLatLng = [9.9312, 76.2673]; 
        
        const map = L.map(mapRef.current, { 
            zoomControl: false,
            attributionControl: false 
        }).setView(fallbackLatLng, 15); 
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        const neonIcon = L.divIcon({
          className: 'custom-neon-marker',
          html: `<div style="width:16px;height:16px;background-color:#a3e635;border-radius:50%;box-shadow:0 0 15px #a3e635, inset 0 0 5px #000; border: 2px solid #0f172a;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        markerRef.current = L.marker(fallbackLatLng, { icon: neonIcon }).addTo(map);
        // The path line
        pathRef.current = L.polyline([], { color: '#a3e635', weight: 4, opacity: 0.8, dashArray: '10, 10' }).addTo(map);
        // The captured area polygon feature
        polygonRef.current = L.polygon([], { color: '#06b6d4', weight: 2, fillColor: '#06b6d4', fillOpacity: 0.2 }).addTo(map);
        
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 15);
                markerRef.current.setLatLng([latitude, longitude]);
            },
            () => console.log("Using fallback location."),
            { enableHighAccuracy: true, timeout: 5000 }
            );
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Real-time tracking + Simulation Fallback
  useEffect(() => {
    let watchId;
    let simInterval;
    
    if (isTracking && "geolocation" in navigator && window.L) {
      let lastPos = null;
      let pathArray = [...trackPathRef.current];

      const processLocation = (lat, lng) => {
          const newLatLng = [lat, lng];
          const lObj = window.L.latLng(lat, lng);
          
          if (mapInstanceRef.current && markerRef.current && pathRef.current && polygonRef.current) {
             markerRef.current.setLatLng(newLatLng);
             mapInstanceRef.current.panTo(newLatLng);
             
             pathRef.current.addLatLng(newLatLng);
             pathArray.push(lObj);
             trackPathRef.current = pathArray;

             // Update polygon overlay
             if (pathArray.length >= 3) {
                polygonRef.current.setLatLngs(pathArray);
                setAreaCaptured(calculateArea(pathArray));
             }
             
             if (lastPos) {
                 const dist = window.L.latLng(lastPos).distanceTo(lObj);
                 setDistance(prev => prev + (dist / 1000));
             }
             lastPos = newLatLng;
          }
      };

      watchId = navigator.geolocation.watchPosition(
        (pos) => processLocation(pos.coords.latitude, pos.coords.longitude),
        (err) => {
           console.log("Falling back to simulated movement...");
           setIsSimulating(true);
           if (watchId) navigator.geolocation.clearWatch(watchId);
           
           let simLat = 9.9312;
           let simLng = 76.2673;
           if (lastPos) { simLat = lastPos[0]; simLng = lastPos[1]; } 
           else if (markerRef.current) {
             const cLat = markerRef.current.getLatLng();
             simLat = cLat.lat; simLng = cLat.lng;
           }

           simInterval = setInterval(() => {
              // Creating a circular motion to build a cool polygon area!
              const radius = 0.001; 
              const elapsed = time + (pathArray.length * 2);
              const angle = elapsed * 0.1;
              const nLat = simLat + Math.sin(angle) * (radius * 0.5); // Oval loop
              const nLng = simLng + Math.cos(angle) * radius;
              
              processLocation(nLat, nLng);
           }, 2000);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (simInterval) clearInterval(simInterval);
    };
  }, [isTracking]);

  const toggleTracking = () => {
      if (!isTracking) {
          setDistance(0);
          setAreaCaptured(0);
          setTime(0);
          trackPathRef.current = [];
          if (pathRef.current) pathRef.current.setLatLngs([]);
          if (polygonRef.current) polygonRef.current.setLatLngs([]);
      }
      setIsTracking(!isTracking);
  };

  const formatTime = (seconds) => {
     const m = Math.floor(seconds / 60).toString().padStart(2, '0');
     const s = (seconds % 60).toString().padStart(2, '0');
     return `${m}:${s}`;
  };

  return (
      <div className="h-[calc(100vh-120px)] md:h-full relative rounded-2xl overflow-hidden border border-slate-800 animate-in fade-in duration-300">
        
        {/* Map Container */}
        <div ref={mapRef} className="absolute inset-0 bg-slate-950 z-0"></div>

        {/* UI Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl pointer-events-auto shadow-lg">
            <div className={`text-[10px] font-bold uppercase flex items-center gap-2 mb-1 ${isTracking ? (isSimulating ? 'text-amber-400' : 'text-lime-400') : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isTracking ? (isSimulating ? 'bg-amber-400 animate-pulse' : 'bg-lime-400 animate-pulse') : 'bg-slate-700'}`}></span> 
              Tracking Status
            </div>
            <div className={`text-sm font-black uppercase tracking-wider ${isTracking ? 'text-white' : 'text-slate-500'}`}>
                {isTracking ? (isSimulating ? 'GPS Blocked: Simulating' : 'Route Tracking Active') : 'Ready to Track'}
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2">
                 <div className={`h-full rounded-full transition-all ${isTracking ? (isSimulating ? 'bg-amber-500' : 'bg-lime-500') + ' w-[100%] animate-pulse' : 'bg-slate-700 w-[0%]'}`}></div>
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-right ml-auto pointer-events-auto shadow-lg hidden sm:block">
             <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Captured Area</div>
             <div className="text-xl font-black text-white">{areaCaptured > 10000 ? (areaCaptured/1000000).toFixed(2) + ' km²' : Math.floor(areaCaptured) + ' m²'}</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-end gap-4 pointer-events-none z-10">
          <div className="flex gap-2 pointer-events-auto w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <div className="flex-1 sm:flex-none bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-center min-w-[90px]">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Distance</div>
              <div className={`text-lg sm:text-xl font-black ${isTracking ? 'text-lime-400' : 'text-slate-600'}`}>
                  {distance.toFixed(2)} <span className="text-xs">km</span>
              </div>
            </div>
            <div className="flex-1 sm:flex-none bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-center min-w-[90px]">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Elapsed</div>
              <div className={`text-lg sm:text-xl font-black ${isTracking ? 'text-white' : 'text-slate-600'}`}>
                  {formatTime(time)}
              </div>
            </div>
            {/* Mobile captured area display */}
            <div className="flex-1 sm:hidden bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-center min-w-[90px]">
               <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Area</div>
               <div className="text-lg sm:text-xl font-black text-white">{Math.floor(areaCaptured)} <span className="text-xs">m</span></div>
            </div>
          </div>

          <button 
            onClick={toggleTracking}
            className={`w-full sm:w-auto pointer-events-auto p-4 rounded-xl font-black flex items-center justify-center gap-2 border transition-all hover:scale-105 active:scale-95
              ${isTracking 
                ? 'bg-rose-500 hover:bg-rose-400 text-white border-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
                : 'bg-lime-500 hover:bg-lime-400 text-slate-950 border-lime-600 shadow-[0_0_20px_rgba(132,204,22,0.3)]'
              }`}
          >
            {isTracking ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
            <span className="uppercase tracking-wider">{isTracking ? 'Stop Tracking' : 'Start Path'}</span>
          </button>
        </div>
      </div>
  );
};


// --- Authentication View ---
const AuthView = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `http://127.0.0.1:8787${endpoint}`; // Targets local wrangler dev server
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (!isLogin) {
        setIsLogin(true);
        setError('Registration successful! Please log in.');
        setUsername('');
        setPassword('');
        return;
      }

      onLogin(data.token, data.user);
    } catch (err) {
      if (err.message === 'Failed to fetch') {
         setError('Cannot connect to Cloudflare Worker. Run `npm run dev` in backend folder.');
      } else {
         setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={32} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 uppercase drop-shadow-md">Seize</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">{isLogin ? 'Sign in to sync your progress' : 'Create an account to join'}</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
              placeholder="athlete123"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black uppercase text-sm py-4 rounded-2xl transition-all shadow-lg hover:shadow-violet-500/30 mt-4">
            {isLogin ? 'Enter Arena' : 'Forge Profile'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-zinc-500 hover:text-violet-400 transition-colors focus:outline-none">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
            {activeTab === 'standard' && <StandardWorkoutView recentLogs={recentLogs} />}
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