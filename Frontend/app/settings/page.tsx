'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try { localStorage.setItem('API_URL', apiUrl); toast.success('Saved'); } catch (e) { toast.error('Failed'); }
    finally { setTimeout(() => setIsSaving(false), 800); }
  };

  return (
    <div className="min-h-screen px-6 py-16 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-6xl font-black tracking-tighter mb-2"><span className="neon-text">Settings</span></h1>
        <p className="text-slate-500">Tune your backend and system config.</p>
      </div>

      <div className="theme-card p-8 shadow-2xl shadow-cyan-900/10">
        <h2 className="text-2xl font-black mb-6">API Endpoint</h2>
        <input
          type="text"
          value={apiUrl}
          onChange={e => setApiUrl(e.target.value)}
          className="w-full px-5 py-4 rounded-2xl bg-slate-900/30 border border-slate-700/40 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all mb-4 font-mono text-sm"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 text-black shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:shadow-[0_0_50px_rgba(0,255,247,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Environment', value: 'Production' },
          { label: 'API URL', value: apiUrl },
          { label: 'Status', value: '✓ Ready', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="theme-card p-6 shadow-xl shadow-cyan-900/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-300 mb-1">{s.label}</h3>
            <p className={`text-xl font-black ${s.color || 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
