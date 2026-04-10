export const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
  ? 'http://127.0.0.1:8787' 
  : 'https://seize-backend.freefiredond.workers.dev';
