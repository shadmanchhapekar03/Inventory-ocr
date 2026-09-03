'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface BulkUploadZoneProps {
  onProductImagesSelect: (files: File[]) => void;
  onLabelImagesSelect: (files: File[]) => void;
  productImages: File[];
  labelImages: File[];
  isLoading: boolean;
}

export default function BulkUploadZone({
  onProductImagesSelect,
  onLabelImagesSelect,
  productImages,
  labelImages,
  isLoading,
}: BulkUploadZoneProps) {
  const [dragProduct, setDragProduct] = useState(false);
  const [dragLabel, setDragLabel] = useState(false);
  const [previewsProduct, setPreviewsProduct] = useState<(string | null)[]>([]);
  const [previewsLabel, setPreviewsLabel] = useState<(string | null)[]>([]);

  // Generate previews for product images - FAST (instant + parallel)
  const generatePreviews = useCallback((files: File[]) => {
    const previews: (string | null)[] = new Array(files.length).fill(null);
    setPreviewsProduct(previews);

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[idx] = e.target?.result as string;
        setPreviewsProduct([...previews]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Generate previews for label images - FAST (instant + parallel)
  const generateLabelPreviews = useCallback((files: File[]) => {
    const previews: (string | null)[] = new Array(files.length).fill(null);
    setPreviewsLabel(previews);

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[idx] = e.target?.result as string;
        setPreviewsLabel([...previews]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleProductDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragProduct(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onProductImagesSelect(files);
        generatePreviews(files);
      }
    },
    [onProductImagesSelect, generatePreviews]
  );

  const handleLabelDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragLabel(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onLabelImagesSelect(files);
        generateLabelPreviews(files);
      }
    },
    [onLabelImagesSelect, generateLabelPreviews]
  );

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const combined = [...productImages, ...newFiles].slice(0, 10); // Max 10 images
    if (combined.length > 0) {
      onProductImagesSelect(combined);
      generatePreviews(combined);
    }
  };

  const handleLabelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const combined = [...labelImages, ...newFiles].slice(0, 10); // Max 10 images
    if (combined.length > 0) {
      onLabelImagesSelect(combined);
      generateLabelPreviews(combined);
    }
  };

  const removeProductImage = (idx: number) => {
    const updated = productImages.filter((_, i) => i !== idx);
    onProductImagesSelect(updated);
    setPreviewsProduct(previewsProduct.filter((_, i) => i !== idx));
  };

  const removeLabelImage = (idx: number) => {
    const updated = labelImages.filter((_, i) => i !== idx);
    onLabelImagesSelect(updated);
    setPreviewsLabel(previewsLabel.filter((_, i) => i !== idx));
  };

  const renderUploadZone = (
    type: 'product' | 'label',
    title: string,
    isDrag: boolean,
    setIsDrag: (v: boolean) => void,
    handleDrop: (e: React.DragEvent) => void,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    files: File[],
    previews: (string | null)[],
    onRemove: (idx: number) => void
  ) => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">{title}</h2>

        {/* Drop Zone */}
        <div
          className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 backdrop-blur-md ${
            isDrag
              ? 'border-cyan-400 scale-[1.02] shadow-[0_0_40px_rgba(0,255,247,0.2)] bg-cyan-900/10'
              : 'border-slate-700/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,247,0.15)]'
          }`}
          style={{ background: isDrag ? 'rgba(0, 80, 100, 0.1)' : 'rgba(5,8,25,0.6)' }}
          onDragEnter={() => setIsDrag(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDrag(true);
          }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={handleDrop}
        >
          {/* Glowing corner accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-400/30 rounded-tl-md" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-rose-400/30 rounded-br-md" />

          <input
            type="file"
            id={`${type}-bulk-upload`}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {/* Separate input for "Add More" button */}
          <input
            type="file"
            id={`${type}-bulk-upload-add`}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <label htmlFor={`${type}-bulk-upload`} className={`block cursor-pointer ${isLoading ? 'cursor-not-allowed' : ''}`}>
            <div className="p-8 md:p-10">
              {files.length === 0 ? (
                <div className="flex flex-col items-center gap-5 py-10 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-rose-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,247,0.2)]">
                    <svg className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">Click or Drag</h3>
                    <p className="text-cyan-300/80 text-sm">
                      {type === 'product' ? 'Drop product images here' : 'Drop label images here'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent">
                      {files.length} {files.length === 1 ? 'image' : 'images'} selected
                    </p>
                  </div>
                  <div className={`grid gap-3 transition-all duration-500 ${
                    files.length <= 2 ? 'grid-cols-2' :
                    files.length <= 4 ? 'grid-cols-2 sm:grid-cols-3' :
                    files.length <= 6 ? 'grid-cols-3 sm:grid-cols-4' :
                    'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                  }`}>
                    {previews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative overflow-hidden rounded-xl shadow-lg shadow-cyan-900/20">
                          {preview ? (
                            <Image
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              width={150}
                              height={150}
                              className={`w-full object-cover hover:scale-[1.05] transition-all duration-300 ${
                                files.length <= 3 ? 'h-32' :
                                files.length <= 6 ? 'h-24' :
                                'h-20'
                              }`}
                            />
                          ) : (
                            <div className={`w-full bg-slate-700/50 animate-pulse ${
                              files.length <= 3 ? 'h-32' :
                              files.length <= 6 ? 'h-24' :
                              'h-20'
                            }`} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <button
                          onClick={() => onRemove(idx)}
                          disabled={isLoading}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        >
                          ✕
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{files[idx].name}</p>
                      </div>
                    ))}

                    {/* Add More Button - Only show if less than 10 images */}
                    {files.length < 10 && (
                      <label htmlFor={`${type}-bulk-upload-add`} className="cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl shadow-lg shadow-cyan-900/20 border-2 border-dashed border-cyan-400/50 hover:border-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(0,255,247,0.3)] flex items-center justify-center group">
                          <div className={`w-full bg-slate-800/50 group-hover:bg-slate-700/50 transition-all flex items-center justify-center ${
                            files.length <= 3 ? 'h-32' :
                            files.length <= 6 ? 'h-24' :
                            'h-20'
                          }`}>
                            <div className="flex flex-col items-center gap-1">
                              <svg className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-xs font-bold text-cyan-400">Add More</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Clear All Button */}
        {files.length > 0 && (
          <button
            onClick={() => {
              if (type === 'product') {
                onRemove(-1); // Dummy, we'll handle this differently
              }
            }}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-rose-400 transition-all disabled:opacity-30"
          >
            Clear All {type === 'product' ? 'Products' : 'Labels'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {renderUploadZone(
        'product',
        'Product Photos',
        dragProduct,
        setDragProduct,
        handleProductDrop,
        handleProductFileChange,
        productImages,
        previewsProduct,
        (idx) => {
          if (idx === -1) {
            onProductImagesSelect([]);
            setPreviewsProduct([]);
          } else {
            removeProductImage(idx);
          }
        }
      )}

      {renderUploadZone(
        'label',
        'Label Photos',
        dragLabel,
        setDragLabel,
        handleLabelDrop,
        handleLabelFileChange,
        labelImages,
        previewsLabel,
        (idx) => {
          if (idx === -1) {
            onLabelImagesSelect([]);
            setPreviewsLabel([]);
          } else {
            removeLabelImage(idx);
          }
        }
      )}
    </div>
  );
}
