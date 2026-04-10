import React, { useState, useEffect, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import * as turf from '@turf/turf';

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
           console.log("GPS signal weak or blocked. Falling back to simulated movement...", err.message);
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
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 } // Increased timeout to 15s to allow better GPS lock
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

export default MapView;
