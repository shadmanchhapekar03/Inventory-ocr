'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  onProductImageSelect: (f: File) => void;
  onLabelImageSelect: (f: File) => void;
  productImage: File | null;
  labelImage: File | null;
  isLoading: boolean;
}

export default function UploadZone({ onProductImageSelect, onLabelImageSelect, productImage, labelImage, isLoading }: Props) {
  const [drag, setDrag] = useState<'product' | 'label' | null>(null);
  const [previewP, setPreviewP] = useState('');
  const [previewL, setPreviewL] = useState('');

  useEffect(() => {
    if (productImage) {
      const r = new FileReader();
      r.onload = (e) => setPreviewP(e.target?.result as string);
      r.readAsDataURL(productImage);
    } else setPreviewP('');
  }, [productImage]);

  useEffect(() => {
    if (labelImage) {
      const r = new FileReader();
      r.onload = (e) => setPreviewL(e.target?.result as string);
      r.readAsDataURL(labelImage);
    } else setPreviewL('');
  }, [labelImage]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'product' | 'label') => {
    e.preventDefault();
    setDrag(null);
    const f = e.dataTransfer.files?.[0];
    if (f) (type === 'product' ? onProductImageSelect : onLabelImageSelect)(f);
  }, [onProductImageSelect, onLabelImageSelect]);

  const renderZone = (type: 'product' | 'label', label: string, desc: string, icon: React.ReactNode) => {
    const isDrag = drag === type;
    const preview = type === 'product' ? previewP : previewL;
    const img = type === 'product' ? productImage : labelImage;
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 backdrop-blur-md ${
          isDrag ? 'border-cyan-400 scale-[1.02] shadow-[0_0_40px_rgba(0,255,247,0.2)]' : 'border-slate-700/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,247,0.15)]'
        }`}
        style={{ background: 'rgba(5,8,25,0.6)' }}
        onDragEnter={() => setDrag(type)}
        onDragOver={e => { e.preventDefault(); setDrag(type); }}
        onDragLeave={() => setDrag(null)}
        onDrop={e => handleDrop(e, type)}
      >
        {/* Glowing corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-400/30 rounded-tl-md" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-rose-400/30 rounded-br-md" />

        <input
          type="file"
          id={`${type}-upload`}
          className="hidden"
          accept="image/*"
          onChange={e => { if (e.target.files?.[0]) (type === 'product' ? onProductImageSelect : onLabelImageSelect)(e.target.files[0]); }}
          disabled={isLoading}
        />
        <label htmlFor={`${type}-upload`} className={`block cursor-pointer ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <div className="p-8 md:p-10">
            {preview ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-cyan-900/20">
                  <Image src={preview} alt="Preview" width={400} height={250} className="w-full h-64 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">📁 {img?.name}</p>
                  <p className="text-cyan-300/60 text-xs font-medium">Click to replace</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 py-10 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-rose-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,247,0.2)]">
                  {icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">{label}</h3>
                  <p className="text-cyan-300/80 text-sm">{desc}</p>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderZone('product', 'Product Photo', 'Drop barcode image', (
        <svg className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      ))}
      {renderZone('label', 'Label Photo', 'Drop MRP / batch / dates photo', (
        <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      ))}
    </div>
  );
}
