import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { API_BASE } from '../../config/constants';

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
      const url = `${API_BASE}${endpoint}`;
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

export default AuthView;
