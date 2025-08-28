'use client';

import { useState } from 'react';
//import clsx from 'clsx';

interface FilterUPPSPopoverProps {
  open: boolean;
  onClose: () => void;
  defaultPeriode: string;
  defaultSelectedIds: string[];
  onApply: (data: { periode: string; ids: string[] }) => void;
  onReset: () => void;
}

const options = [
  { id: 'tel-u-bdg', label: 'Tel-U Bandung' },
  { id: 'tel-u-jkt', label: 'Tel-U Jakarta' },
  { id: 'tel-u-pwk', label: 'Tel-U Purwokerto' },
  { id: 'tel-u-sby', label: 'Tel-U Surabaya' },
];

const periodeOptions = [
  'Ganjil 2025',
  'Genap 2025',
  'Ganjil 2024',
  'Genap 2024',
  'Ganjil 2023',
  'Genap 2023',
];

export default function FilterUPPSPopover({
  open,   
 
  defaultPeriode,
  defaultSelectedIds,
  onApply,
  onReset,
}: FilterUPPSPopoverProps) {
  const [periode, setPeriode] = useState<string>(defaultPeriode);
  const [ids, setIds] = useState<string[]>(defaultSelectedIds);

  const toggleId = (id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl border z-20">
      <div className="p-4 space-y-4">
        {/* Periode */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Pilih Periode
          </label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-red-400"
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
        <div>
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ids.includes(opt.id)}
                onChange={() => toggleId(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => onApply({ periode, ids })}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded w-full"
          >
            Terapkan
          </button>
          <button
            onClick={onReset}
            className="border border-gray-400 hover:bg-gray-100 text-gray-800 px-4 py-2 rounded w-full"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}


