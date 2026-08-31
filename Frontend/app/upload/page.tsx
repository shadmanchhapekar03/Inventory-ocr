'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import UploadZone from '@/components/UploadZone';
import { processProduct } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [productImage, setProductImage] = useState<File | null>(null);
  const [labelImage, setLabelImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleUpload = async () => {
    if (!productImage || !labelImage) {
      toast.error('Select both images');
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);
    setProcessingStatus('Uploading images...');
    try {
      const interval = setInterval(() => setUploadProgress(p => p >= 90 ? p : Math.min(90, p + Math.random() * 8)), 400);
      setProcessingStatus('Scanning barcode + reading label...');
      const result = await processProduct(productImage, labelImage);
      clearInterval(interval);
      setUploadProgress(100);
      setProcessingStatus('Processed!');
      sessionStorage.setItem('reviewData', JSON.stringify(result));
      toast.success('Success');
      setTimeout(() => router.push('/review'), 600);
    } catch (e: any) {
      toast.error(e?.error || e?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      setProcessingStatus('');
    }
  };

  const canUpload = productImage && labelImage && !isLoading;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-cyan-400/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[70vw] h-[70vw] rounded-full bg-rose-500/10 blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[40%] left-[60%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-400/10 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-10">
        {/* Hero Header */}
        <header className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <span className="neon-text">Upload</span>
            <span className="text-white/90"> Products</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto">
            Drop two images. AI reads barcode + labels instantly. Zero typing.
          </p>
        </header>

        {/* Upload Card */}
        <div className="theme-card p-8 md:p-10 shadow-2xl shadow-cyan-900/10">
          <UploadZone
            onProductImageSelect={setProductImage}
            onLabelImageSelect={setLabelImage}
            productImage={productImage}
            labelImage={labelImage}
            isLoading={isLoading}
          />
        </div>

        {/* Progress */}
        {isLoading && (
          <div className="theme-card p-6 shadow-xl shadow-cyan-900/20">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium text-slate-200">{processingStatus || 'Processing...'}</span>
              <span className="font-black text-cyan-400">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden bg-slate-700/40">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400 via-rose-400 to-fuchsia-400"
                style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%`, boxShadow: '0 0 20px rgba(0,255,247,0.4)' }}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className="px-10 py-4 rounded-2xl font-black text-white text-lg tracking-tight shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:shadow-[0_0_50px_rgba(0,255,247,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-400 to-rose-400"
          >
            {isLoading ? 'Processing...' : 'Upload & Process →'}
          </button>
          <button
            onClick={() => { setProductImage(null); setLabelImage(null); }}
            disabled={isLoading}
            className="px-8 py-4 rounded-2xl font-bold text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 bg-slate-800/30 backdrop-blur-md"
          >
            Clear
          </button>
        </div>

        {/* Tips */}
        <div className="theme-card p-7 shadow-xl shadow-cyan-900/5">
          <h3 className="font-black text-xl mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-rose-400 flex items-center justify-center text-black text-sm">✦</span>
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm text-slate-400">
            {[
              'Clear barcode on product photo',
              'MRP, batch, dates visible on label',
              'Good lighting = faster AI',
              'JPG / PNG / WebP supported',
              'Keep under 10MB for speed',
              'Backend must run on :8000',
            ].map(t => (
              <div key={t} className="flex items-center gap-2 text-slate-300">✓ <span>{t}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
