'use client';

import { useState, useMemo } from 'react';
import { SheetRow } from '@/lib/api';

interface Props {
  data: SheetRow[];
  isLoading?: boolean;
}
const PER_PAGE = 10;

export default function DataTable({ data, isLoading = false }: Props) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof SheetRow>('date_added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let d = data.filter(r =>
      r.product_name.toLowerCase().includes(search.toLowerCase()) ||
      r.barcode.toLowerCase().includes(search.toLowerCase())
    );
    d.sort((a, b) => {
      const av = a[sortField]; const bv = b[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return sortOrder === 'asc' ? -1 : 1;
      if (bv == null) return sortOrder === 'asc' ? 1 : -1;
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return d;
  }, [data, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (f: keyof SheetRow) => {
    setSortField(f);
    setSortOrder(prev => (f === sortField ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
    setPage(1);
  };

  const headers = [
    { key: 'product_name' as const, label: 'Product' },
    { key: 'barcode' as const, label: 'Barcode' },
    { key: 'mrp' as const, label: 'MRP' },
    { key: 'batch' as const, label: 'Batch' },
    { key: 'mfg' as const, label: 'MFG' },
    { key: 'exp' as const, label: 'EXP' },
    { key: 'quantity' as const, label: 'Qty' },
    { key: 'date_added' as const, label: 'Added' },
  ];

  if (isLoading) {
    return (
      <div className="theme-card rounded-3xl p-16 text-center shadow-2xl shadow-cyan-900/10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400 animate-[spin_2s_linear_infinite] shadow-[0_0_40px_rgba(0,255,247,0.4)]" />
        <p className="text-slate-400 text-lg font-medium">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Export */}
      <div className="theme-card p-6 shadow-xl shadow-cyan-900/10 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">Search</label>
          <input
            type="text"
            placeholder="Product or barcode..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 transition-all"
          />
        </div>
        <div className="text-sm text-slate-500">{filtered.length} products</div>
      </div>

      {/* Table */}
      <div className="theme-card rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-900/80 to-slate-800/50">
              <tr>
                {headers.map(h => (
                  <th key={h.key} onClick={() => handleSort(h.key)} className="text-left px-5 py-4 font-black text-xs uppercase tracking-wider text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors">
                    <div className="flex items-center gap-2">{h.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-500 text-lg">No results found</td></tr>
              ) : paginated.map((row, i) => (
                <tr key={i} className="hover:bg-cyan-400/5 transition-colors group">
                  <td className="px-5 py-4 font-semibold text-white">{row.product_name}</td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">{row.barcode}</td>
                  <td className="px-5 py-4 text-cyan-300 font-bold">₹{row.mrp}</td>
                  <td className="px-5 py-4 text-slate-400">{row.batch}</td>
                  <td className="px-5 py-4 text-slate-400">{row.mfg}</td>
                  <td className="px-5 py-4 text-rose-300">{row.exp}</td>
                  <td className="px-5 py-4 text-slate-300">{row.quantity}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{new Date(row.date_added).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 disabled:opacity-30">Prev</button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
