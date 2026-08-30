'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DataTable from '@/components/DataTable';
import { getSheetsData, SheetRow } from '@/lib/api';

export default function DataPage() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true); setError(null);
    try {
      const result = await getSheetsData();
      if (Array.isArray(result)) {
        setData(result);
        if (result.length > 0) toast.success(`Loaded ${result.length} products`);
        else toast.info('No products yet');
      } else {
        setError('Invalid data format');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      toast.error('Load error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-6 py-12 max-w-7xl mx-auto">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(0,255,247,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,42,106,0.05) 0%, transparent 40%)' }} />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">
              <span className="neon-text">Inventory</span>
            </h1>
            <p className="text-slate-400 text-sm">{isLoading ? 'Loading...' : error ? 'Error' : `${data.length} products tracked`}</p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-400 to-violet-400 text-black shadow-[0_0_30px_rgba(0,255,247,0.25)] hover:shadow-[0_0_50px_rgba(0,255,247,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-30"
          >
            {isLoading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {error && (
          <div className="theme-card p-5 border border-rose-400/20 shadow-lg shadow-rose-900/5">
            <p className="text-rose-300 font-medium">⚠ Error: {error}</p>
          </div>
        )}

        <DataTable data={data} isLoading={isLoading} />

        {!isLoading && data.length === 0 && !error && (
          <div className="theme-card p-16 text-center shadow-2xl shadow-cyan-900/10">
            <div className="text-7xl mb-5">📦</div>
            <h3 className="text-2xl font-black mb-2">No Data Yet</h3>
            <p className="text-slate-500 mb-6">Upload your first product to start tracking.</p>
            <a href="/upload" className="inline-block px-8 py-3 rounded-2xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 text-black shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:-translate-y-1 transition-all">Go Upload →</a>
          </div>
        )}
      </div>
    </div>
  );
}
