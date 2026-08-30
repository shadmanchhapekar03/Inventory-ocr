'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ProductForm from '@/components/ProductForm';
import ValidationWarning from '@/components/ValidationWarning';
import { confirmAndSave, ProcessProductResponse } from '@/lib/api';

export default function ReviewPage() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ProcessProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('reviewData');
    if (stored) {
      try {
        setReviewData(JSON.parse(stored));
      } catch (e) {
        toast.error('Failed to load review data');
        router.push('/upload');
      }
    } else {
      toast.error('No data to review. Upload first.');
      router.push('/upload');
    }
    setIsInitialLoading(false);
  }, [router]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        product_name: data.product_name || 'Unknown',
        barcode: data.barcode || 'N/A',
        mrp: data.mrp || '0',
        batch: data.batch || '',
        mfg: data.mfg || '',
        exp: data.exp || '',
        quantity: data.quantity || '0',
      };
      const result = await confirmAndSave(payload);
      if (result.success) {
        toast.success('Product saved!');
        sessionStorage.removeItem('reviewData');
        router.push('/data');
      } else {
        toast.error(result.error || 'Failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('reviewData');
    router.push('/upload');
  };

  if (isInitialLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_30px_rgba(0,255,247,0.3)]" />
    </div>
  );
  if (!reviewData) return null;

  const product = reviewData.product?.product || {};
  const label = reviewData.label || {};
  const validation = reviewData.validation || { valid: true, warnings: [], errors: [] };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="theme-card p-8 shadow-2xl shadow-cyan-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-rose-400/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="neon-text">Review</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono">ID: {reviewData.review_id}</p>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="theme-card p-6 shadow-xl shadow-cyan-900/5">
          <h2 className="font-black text-xl mb-4 text-cyan-300">Extracted Product</h2>
          <div className="space-y-3 text-sm text-slate-300">
            {[
              ['Name', product.product_name || 'N/A'],
              ['Barcode', reviewData.product?.barcode || 'N/A'],
              ['Method', reviewData.product?.method || 'N/A'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-700/30 pb-2">
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="theme-card p-6 shadow-xl shadow-cyan-900/5">
          <h2 className="font-black text-xl mb-4 text-rose-300">Label Data</h2>
          <div className="space-y-3 text-sm text-slate-300">
            {[
              ['MRP', `₹${label.mrp || '0'}`],
              ['Batch', label.batch || 'N/A'],
              ['MFG', label.mfg || 'N/A'],
              ['EXP', label.exp || 'N/A'],
              ['Quantity', label.quantity || 'N/A'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-700/30 pb-2">
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="theme-card p-8 shadow-2xl shadow-cyan-900/10">
        <h2 className="text-2xl font-black mb-6">Edit & Confirm</h2>
        <ProductForm
          productName={product.product_name}
          barcode={reviewData.product?.barcode}
          mrp={label.mrp}
          batch={label.batch}
          mfgDate={label.mfg}
          expDate={label.exp}
          quantity={label.quantity}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Cancel */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-8 py-3 rounded-2xl font-bold border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
        >
          Cancel & Restart
        </button>
      </div>
    </div>
  );
}
