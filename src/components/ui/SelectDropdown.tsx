'use client';

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  
} from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import clsx from 'clsx';

export type Option = {
  label: string;
  value: string;
};

type ValueType = string | string[] | null;

export interface UniversalDropdownProps {
  /** daftar opsi */
  options: Option[];
  /** nilai yang dipilih: string untuk single, string[] untuk multi */
  value: ValueType;
  /** callback saat nilai berubah */
  onChange: (v: ValueType) => void;
  /** apakah multi select */
  multi?: boolean;
  /** teks placeholder */
  placeholder?: string;
  /** className tambahan untuk trigger */
  className?: string;
  /** pisah label yang dipilih pakai apa (default: " | ") */
  joinWith?: string;
  /** tampilkan tombol reset di dropdown */
  showReset?: boolean;
  /** tutup dropdown ketika memilih opsi (untuk single-select saja) */
  closeOnSelectSingle?: boolean;
}

export default function UniversalDropdown({
  options,
  value,
  onChange,
  multi = false,
  placeholder = 'Pilih…',
  className,
  joinWith = ' | ',
  showReset = true,
  closeOnSelectSingle = true,
}: UniversalDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo<string[]>(
    () =>
      value == null
        ? []
        : Array.isArray(value)
        ? value
        : value
        ? [value]
        : [],
    [value]
  );

  const displayLabel = useMemo(() => {
    if (!selectedValues.length) return '';
    const labels = selectedValues
      .map((v) => options.find((o) => o.value === v)?.label)
      .filter(Boolean) as string[];
    return labels.join(joinWith);
  }, [selectedValues, options, joinWith]);

  // klik di luar -> tutup
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // esc -> tutup
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleValue = (val: string) => {
    if (!multi) {
      onChange(val);
      if (closeOnSelectSingle) setOpen(false);
      return;
    }
    // multi
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const reset = () => {
    onChange(multi ? [] : null);
  };

  return (
    <div ref={ref} className={clsx('relative min-w-[220px]', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'w-full flex justify-between items-center gap-2 border border-gray-300 rounded-md bg-white px-3 py-2 text-sm',
          'hover:bg-gray-50'
        )}
      >
        <span
          className={clsx(
            'truncate',
            !displayLabel && 'text-gray-400 italic'
          )}
        >
          {displayLabel || placeholder}
        </span>
        <FiChevronDown className="text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
          <ul className="py-2 text-sm text-gray-700">
            {options.map((opt) => {
              const checked = selectedValues.includes(opt.value);
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left',
                      checked && 'bg-gray-50'
                    )}
                    onClick={() => toggleValue(opt.value)}
                  >
                    {multi ? (
                      <input
                        readOnly
                        type="checkbox"
                        checked={checked}
                        className="accent-red-600"
                      />
                    ) : (
                      <span
                        className={clsx(
                          'inline-block w-2 h-2 rounded-full border',
                          checked ? 'bg-red-600 border-red-600' : 'border-gray-300'
                        )}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {showReset && (
            <div className="border-t p-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-700 border rounded py-1.5 hover:bg-gray-50"
              >
                <FiX /> Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
