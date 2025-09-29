'use client';

import { useState, useEffect } from 'react';

export interface FilterPayload {
  periode: string;
  ids: string[];
}

interface Option {
  id: string;
  label: string;
}

interface FilterUPPSPopoverProps {
  open: boolean;
  onClose: () => void;
  defaultPeriode: string;
  defaultSelectedIds: string[];
  options: Option[];
  periodeOptions: string[];   // <-- tambahkan ini
  onApply: (data: FilterPayload) => void;
  onReset: () => void;
}


export default function FilterUPPSPopover({
  open,
  onClose,
  defaultPeriode,
  defaultSelectedIds,
  options,
  periodeOptions,
  onApply,
  onReset,
}: FilterUPPSPopoverProps) {
  const [periode, setPeriode] = useState<string>(defaultPeriode);
  const [ids, setIds] = useState<string[]>(defaultSelectedIds);

  // Sync props → state setiap kali berubah
  useEffect(() => {
    setPeriode(defaultPeriode);
    setIds(defaultSelectedIds);
  }, [defaultPeriode, defaultSelectedIds]);

  const toggle = (id: string | 'all') => {
    if (id === 'all') {
      setIds(ids.length === options.length ? [] : options.map((o) => o.id));
    } else {
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  if (!open) return null;

  return (
    <div className="absolute z-30 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">Filter Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Periode */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Periode
          </label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Pilih Periode --</option>
            {periodeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox UPPS */}
        <div className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-700">
            <input
              type="checkbox"
              checked={ids.length === options.length && options.length > 0}
              onChange={() => toggle('all')}
              className="h-4 w-4 accent-blue-600"
            />
            Semua
          </label>

          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ids.includes(opt.id)}
                onChange={() => toggle(opt.id)}
                className="h-4 w-4 accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Tombol */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              onApply({ periode, ids });
              onClose();
            }}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Terapkan
          </button>
          <button
            onClick={() => {
              onReset();
              setPeriode('');
              setIds([]);
              onClose();
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
