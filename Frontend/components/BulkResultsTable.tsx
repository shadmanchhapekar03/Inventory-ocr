'use client';

import { useState } from 'react';
import { BulkResult } from '@/lib/api';

interface BulkResultsTableProps {
  results: BulkResult[];
  onDataChange: (index: number, field: string, value: any) => void;
  isLoading: boolean;
}

export default function BulkResultsTable({
  results,
  onDataChange,
  isLoading,
}: BulkResultsTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null);

  const isExpired = (expDate: string): boolean => {
    if (!expDate) return false;
    try {
      const parts = expDate.split('/');
      let expDateObj: Date;

      if (parts.length === 2) {
        // MM/YYYY format
        const [month, year] = parts;
        expDateObj = new Date(parseInt(year), parseInt(month) - 1);
      } else if (parts.length === 3) {
        // DD/MM/YYYY format
        const [day, month, year] = parts;
        expDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        return false;
      }

      return expDateObj < new Date();
    } catch {
      return false;
    }
  };

  const getStatus = (result: BulkResult) => {
    if (!result.validation.valid) {
      return { status: '⚠ Review', color: 'text-yellow-400 bg-yellow-900/20', label: 'Review Needed' };
    }
    if (isExpired(result.label.exp as string)) {
      return { status: '⚠ Expired', color: 'text-orange-400 bg-orange-900/20', label: 'Expired' };
    }
    return { status: '✓ Valid', color: 'text-green-400 bg-green-900/20', label: 'Valid' };
  };

  const EditableCell = ({ rowIdx, field, value, onSave }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
      onDataChange(rowIdx, field, tempValue);
      setIsEditing(false);
      setEditingCell(null);
    };

    if (isEditing) {
      return (
        <input
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setEditingCell(null);
            }
          }}
          className="w-full px-2 py-1 rounded bg-slate-700 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      );
    }

    return (
      <span
        onClick={() => {
          setIsEditing(true);
          setEditingCell({ row: rowIdx, field });
        }}
        className="cursor-pointer hover:text-cyan-400 transition-colors"
      >
        {value || 'N/A'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/40">
            <th className="px-4 py-3 text-left font-bold text-slate-300">#</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">Product Name</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">Barcode</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">MRP</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">Batch</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">MFG</th>
            <th className="px-4 py-3 text-left font-bold text-slate-300">EXP</th>
            <th className="px-4 py-3 text-center font-bold text-slate-300">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, idx) => {
            const product = result.product?.product || {};
            const label = result.label || {};
            const statusInfo = getStatus(result);

            return (
              <tr
                key={idx}
                className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                <td className="px-4 py-3">
                  <EditableCell
                    rowIdx={idx}
                    field="product_name"
                    value={product.product_name || ''}
                    onSave={onDataChange}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell
                    rowIdx={idx}
                    field="barcode"
                    value={result.product?.barcode || ''}
                    onSave={onDataChange}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell
                    rowIdx={idx}
                    field="mrp"
                    value={label.mrp || ''}
                    onSave={onDataChange}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell
                    rowIdx={idx}
                    field="batch"
                    value={label.batch || ''}
                    onSave={onDataChange}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableCell
                    rowIdx={idx}
                    field="mfg"
                    value={label.mfg || ''}
                    onSave={onDataChange}
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={isExpired(label.exp as string) ? 'text-orange-400 font-bold' : ''}>
                    <EditableCell
                      rowIdx={idx}
                      field="exp"
                      value={label.exp || ''}
                      onSave={onDataChange}
                    />
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                    {statusInfo.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
