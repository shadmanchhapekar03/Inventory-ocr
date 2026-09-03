'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BulkUploadZone from '@/components/BulkUploadZone';
import BulkResultsTable from '@/components/BulkResultsTable';
import { processBulk, confirmAndSaveBulk, ConfirmSaveRequest, BulkResult } from '@/lib/api';

type PageState = 'upload' | 'processing' | 'results' | 'saving' | 'success';

interface ResultWithEdits extends BulkResult {
  _edited?: { [key: string]: any };
}

export default function BulkProcessPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('upload');
  const [productImages, setProductImages] = useState<File[]>([]);
  const [labelImages, setLabelImages] = useState<File[]>([]);
  const [results, setResults] = useState<ResultWithEdits[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [currentProcessing, setCurrentProcessing] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);

  // Check if counts match
  const countsMismatch = productImages.length !== labelImages.length;
  const hasImages = productImages.length > 0 && labelImages.length > 0;
  const canProcess = hasImages && !countsMismatch && !isLoading;

  // Handle upload process
  const handleProcess = async () => {
    if (countsMismatch) {
      toast.error('Please upload equal number of product and label images');
      return;
    }

    if (!hasImages) {
      toast.error('Please upload images first');
      return;
    }

    setIsLoading(true);
    setPageState('processing');
    setUploadProgress(0);
    setTotalToProcess(productImages.length);
    setProcessingStatus('Preparing upload...');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);

      setProcessingStatus('Uploading images to backend...');
      const bulkResults = await processBulk(productImages, labelImages);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setProcessingStatus('Processing complete!');

      // Prepare results with edit tracking
      const resultsWithEdits: ResultWithEdits[] = bulkResults.results.map(r => ({
        ...r,
        _edited: {},
      }));

      setResults(resultsWithEdits);

      // Show any warnings
      const expiredCount = resultsWithEdits.filter(r => {
        const exp = r.label.exp as string;
        if (!exp) return false;
        try {
          const parts = exp.split('/');
          let expDate: Date;
          if (parts.length === 2) {
            const [month, year] = parts;
            expDate = new Date(parseInt(year), parseInt(month) - 1);
          } else {
            const [, month, year] = parts;
            expDate = new Date(parseInt(year), parseInt(month) - 1);
          }
          return expDate < new Date();
        } catch {
          return false;
        }
      }).length;

      if (expiredCount > 0) {
        toast.warning(`⚠ ${expiredCount} product(s) are expired`);
      }

      setTimeout(() => {
        setPageState('results');
        setIsLoading(false);
      }, 800);
    } catch (e: any) {
      toast.error(e?.error || e?.message || 'Processing failed');
      setIsLoading(false);
      setPageState('upload');
    }
  };

  // Handle data edits
  const handleDataChange = (index: number, field: string, value: any) => {
    const updated = [...results];
    if (!updated[index]._edited) {
      updated[index]._edited = {};
    }
    updated[index]._edited![field] = value;

    // Also update the main data for display
    if (field === 'product_name' && updated[index].product?.product) {
      updated[index].product.product!.product_name = value;
    } else if (field === 'barcode' && updated[index].product) {
      updated[index].product.barcode = value;
    } else if (field in updated[index].label) {
      (updated[index].label as any)[field] = value;
    }

    setResults(updated);
  };

  // Handle confirm and save
  const handleConfirmAndSave = async () => {
    if (results.length === 0) {
      toast.error('No results to save');
      return;
    }

    setIsLoading(true);
    setPageState('saving');
    setProcessingStatus('Saving to Google Sheets...');

    try {
      // Prepare data for saving
      const dataToSave: ConfirmSaveRequest[] = results.map(result => ({
        product_name: result.product?.product?.product_name || result._edited?.product_name || 'Unknown',
        barcode: result.product?.barcode || result._edited?.barcode || 'N/A',
        mrp: result.label.mrp || result._edited?.mrp || '0',
        batch: result.label.batch || result._edited?.batch || '',
        mfg: result.label.mfg || result._edited?.mfg || '',
        exp: result.label.exp || result._edited?.exp || '',
        quantity: result.label.quantity || '0',
      }));

      const saveResult = await confirmAndSaveBulk(dataToSave);

      if (saveResult.success) {
        toast.success(`✓ ${saveResult.count} products saved to Google Sheets`);
        setPageState('success');

        // Clear everything
        setTimeout(() => {
          setProductImages([]);
          setLabelImages([]);
          setResults([]);
        }, 1500);
      } else {
        toast.error(`Failed to save some products. ${saveResult.count} succeeded.`);
        if (saveResult.errors) {
          saveResult.errors.slice(0, 3).forEach(err => toast.error(err));
        }
        setPageState('results');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
      setPageState('results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProductImages([]);
    setLabelImages([]);
    setResults([]);
    setPageState('upload');
  };

  const handleProcessMore = () => {
    setProductImages([]);
    setLabelImages([]);
    setResults([]);
    setPageState('upload');
    setUploadProgress(0);
    setProcessingStatus('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-cyan-400/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[70vw] h-[70vw] rounded-full bg-rose-500/10 blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[40%] left-[60%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-400/10 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-10">
        {/* Upload Page */}
        {pageState === 'upload' && (
          <>
            {/* Hero Header */}
            <header className="text-center space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                <span className="neon-text">Bulk</span>
                <span className="text-white/90"> Process</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto">
                Upload multiple image pairs. AI processes all instantly. Zero manual work.
              </p>
            </header>

            {/* Upload Card */}
            <div className="theme-card p-8 md:p-10 shadow-2xl shadow-cyan-900/10">
              <BulkUploadZone
                onProductImagesSelect={setProductImages}
                onLabelImagesSelect={setLabelImages}
                productImages={productImages}
                labelImages={labelImages}
                isLoading={isLoading}
              />
            </div>

            {/* Count Mismatch Error */}
            {countsMismatch && (
              <div className="theme-card p-4 md:p-6 bg-rose-900/20 border border-rose-500/30 shadow-xl shadow-rose-900/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠</span>
                  <div>
                    <h3 className="font-bold text-rose-300">Count Mismatch</h3>
                    <p className="text-sm text-rose-300/80">
                      Product images: {productImages.length} | Label images: {labelImages.length}
                    </p>
                    <p className="text-sm text-rose-300/60 mt-1">
                      Please upload equal number of product and label images
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            {hasImages && !countsMismatch && (
              <div className="theme-card p-6 bg-cyan-900/10 border border-cyan-500/20 shadow-xl shadow-cyan-900/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">ℹ</span>
                  <div>
                    <h3 className="font-bold text-cyan-300">Ready to Process</h3>
                    <p className="text-sm text-cyan-300/80">
                      {productImages.length} image pair{productImages.length !== 1 ? 's' : ''} will be processed
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Process Button */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleProcess}
                disabled={!canProcess}
                className="px-10 py-4 rounded-2xl font-black text-white text-lg tracking-tight shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:shadow-[0_0_50px_rgba(0,255,247,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-400 to-rose-400"
              >
                {isLoading ? 'Processing...' : `Process ${productImages.length} Pairs →`}
              </button>
            </div>

            {/* Pro Tips */}
            <div className="theme-card p-7 shadow-xl shadow-cyan-900/5">
              <h3 className="font-black text-xl mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-rose-400 flex items-center justify-center text-black text-sm">
                  ✦
                </span>
                Pro Tips
              </h3>
              <div className="grid md:grid-cols-3 gap-3 text-sm text-slate-400">
                {[
                  'Order matters: Product 1 + Label 1, etc',
                  'All images must be clear & well-lit',
                  'JPG / PNG / WebP supported',
                  'Max 10 pairs per batch for best speed',
                  'Keep under 5MB per image',
                  'Backend must run on :8000',
                ].map(t => (
                  <div key={t} className="flex items-center gap-2 text-slate-300">
                    ✓ <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Processing Page */}
        {pageState === 'processing' && (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin shadow-[0_0_30px_rgba(0,255,247,0.3)]" />
              <div>
                <p className="text-3xl font-black text-white mb-2">Processing</p>
                <p className="text-slate-400 text-lg">{processingStatus}</p>
              </div>
            </div>

            <div className="theme-card p-6 shadow-xl shadow-cyan-900/20">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium text-slate-200">{processingStatus}</span>
                <span className="font-black text-cyan-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden bg-slate-700/40">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400 via-rose-400 to-fuchsia-400"
                  style={{
                    width: `${Math.min(100, Math.max(0, uploadProgress))}%`,
                    boxShadow: '0 0 20px rgba(0,255,247,0.4)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Page */}
        {pageState === 'results' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="theme-card p-8 shadow-2xl shadow-cyan-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-rose-400/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
              <div className="relative">
                <h1 className="text-5xl md:text-6xl font-black mb-2">
                  <span className="neon-text">Review Results</span>
                </h1>
                <p className="text-slate-500 text-sm">
                  {results.length} product{results.length !== 1 ? 's' : ''} processed • Click any cell to edit
                </p>
              </div>
            </div>

            {/* Results Table */}
            <div className="theme-card p-6 shadow-2xl shadow-cyan-900/10 overflow-hidden">
              <BulkResultsTable
                results={results}
                onDataChange={handleDataChange}
                isLoading={isLoading}
              />
            </div>

            {/* Warnings */}
            {results.some(r => r.validation.warnings?.length > 0) && (
              <div className="theme-card p-6 bg-yellow-900/10 border border-yellow-500/20 shadow-xl shadow-yellow-900/10">
                <h3 className="font-bold text-yellow-300 mb-3">⚠ Warnings</h3>
                <ul className="space-y-2">
                  {results
                    .flatMap((r, idx) => (r.validation.warnings || []).map(w => ({ idx, warning: w })))
                    .slice(0, 5)
                    .map((item, i) => (
                      <li key={i} className="text-sm text-yellow-300/80">
                        Row {item.idx + 1}: {item.warning}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleConfirmAndSave}
                disabled={isLoading}
                className="px-10 py-4 rounded-2xl font-black text-white text-lg tracking-tight shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:shadow-[0_0_50px_rgba(0,255,247,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 bg-gradient-to-r from-cyan-400 to-rose-400"
              >
                {isLoading ? 'Saving...' : `Confirm & Save ${results.length} →`}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-8 py-4 rounded-2xl font-bold text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:opacity-30 bg-slate-800/30 backdrop-blur-md"
              >
                Cancel & Restart
              </button>
            </div>
          </div>
        )}

        {/* Saving Page */}
        {pageState === 'saving' && (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin shadow-[0_0_30px_rgba(0,255,247,0.3)]" />
              <div>
                <p className="text-3xl font-black text-white mb-2">Saving</p>
                <p className="text-slate-400 text-lg">{processingStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Page */}
        {pageState === 'success' && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="theme-card p-12 shadow-2xl shadow-green-900/20 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
              <div className="relative">
                <div className="text-8xl mb-4">✓</div>
                <h1 className="text-5xl md:text-6xl font-black mb-4">
                  <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    Success!
                  </span>
                </h1>
                <p className="text-2xl text-slate-300 mb-2">
                  {results.length} products saved to Google Sheets
                </p>
                <p className="text-slate-500">All data is now backed up and ready for use</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleProcessMore}
                className="px-10 py-4 rounded-2xl font-black text-white text-lg tracking-tight shadow-[0_0_30px_rgba(0,255,247,0.3)] hover:shadow-[0_0_50px_rgba(0,255,247,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-cyan-400 to-rose-400"
              >
                Process More →
              </button>
              <button
                onClick={() => router.push('/data')}
                className="px-10 py-4 rounded-2xl font-bold text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-slate-800/30 backdrop-blur-md"
              >
                View Data Table
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
