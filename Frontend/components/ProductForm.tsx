'use client';

import { useForm, Controller } from 'react-hook-form';
import { LabelData, ProductData } from '@/lib/api';

interface Props {
  productName?: string;
  barcode?: string;
  mrp?: string | number;
  batch?: string;
  mfgDate?: string;
  expDate?: string;
  quantity?: string | number;
  onSubmit: (d: any) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  productName, barcode, mrp, batch, mfgDate, expDate, quantity, onSubmit, isLoading = false,
}: Props) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      product_name: productName || '',
      barcode: barcode || '',
      mrp: mrp?.toString() || '',
      batch: batch || '',
      mfg: mfgDate || '',
      exp: expDate || '',
      quantity: quantity?.toString() || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'product_name', label: 'Product Name', placeholder: 'e.g. Pure Sip' },
          { name: 'barcode', label: 'Barcode', placeholder: 'e.g. 978...' },
          { name: 'mrp', label: 'MRP (₹)', placeholder: 'e.g. 50.00', type: 'number' },
          { name: 'batch', label: 'Batch', placeholder: 'e.g. B3412' },
          { name: 'mfg', label: 'MFG Date', placeholder: 'DD/MM/YY' },
          { name: 'exp', label: 'EXP Date', placeholder: 'DD/MM/YY' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-black uppercase tracking-widest text-cyan-300 mb-2">{f.label}</label>
            <Controller
              name={f.name as any}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={f.type || 'text'}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 transition-all font-medium"
                  placeholder={f.placeholder}
                />
              )}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-cyan-300 mb-2">Quantity</label>
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              disabled={isLoading}
              className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 transition-all font-medium"
              placeholder="e.g. 71"
            />
          )}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-2xl font-black text-white text-lg tracking-wide bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 shadow-[0_0_40px_rgba(0,255,247,0.3)] hover:shadow-[0_0_60px_rgba(0,255,247,0.5)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Confirm & Save →'}
      </button>
    </form>
  );
}
