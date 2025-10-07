'use client';

import { Dialog } from '@headlessui/react';
import Button from "@/components/button";
import { useState, useEffect } from 'react';
import { validatePeriodeForm } from '@/lib/api-periode';

interface ModalEditPeriodeProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (id: number, data: { 
    tahun: number; 
    semester: string; 
    status: 'active' | 'inactive' 
  }) => void;
  title: string;
  header?: string;
  periode: {
    id: number;
    tahun: number;
    semester: string;
    status: 'active' | 'inactive';
    ActiveenessStatus?: 'active' | 'inactive'; 
  } | null;
}

export default function ModalEditPeriode({
  isOpen,
  onCancel,
  onConfirm,
  title,
  header = "Edit Periode",
  periode,
}: ModalEditPeriodeProps) {
  const [tahun, setTahun] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');

  // Isi form dengan data periode saat modal dibuka
    useEffect(() => {
    if (periode) {
        console.log('Data periode:', periode);

        setTahun(periode.tahun.toString());
        setSemester(periode.semester);

        // Normalisasi status untuk modal
        let normalizedStatus: 'active' | 'inactive' | '' = '';

        if (typeof periode.status === 'string') {
        const lower = periode.status.toLowerCase().trim();
        if (
            lower === 'active' ||
            lower === 'aktif' ||
            lower === '1'
        ) {
            normalizedStatus = 'active';
        } else if (
            lower === 'inactive' ||
            lower === 'nonaktif' ||
            lower === '0'
        ) {
            normalizedStatus = 'inactive';
        }
        }

        setStatus(normalizedStatus);
    }
    }, [periode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi tahun
    if (!/^\d{4}$/.test(tahun)) {
      alert("Tahun harus 4 digit angka (contoh: 2025)");
      return;
    }

    const yearNum = parseInt(tahun);
    if (yearNum < 2000 || yearNum > 2100) {
      alert("Tahun harus antara 2000 - 2100");
      return;
    }

  const validation = validatePeriodeForm({ tahun, semester, status });
  if (!validation.isValid) {
    alert(validation.errors[0]);
    return;
  }

  if (!periode) return;

  onConfirm(periode.id, {
    tahun: parseInt(tahun),
    semester,
    status: status as 'active' | 'inactive'
  });
};

if (!periode) return null;

  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-md shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
          
          {/* 🔵 HEADER BIRU */}
          <div className="bg-blue-800 text-white px-6 py-3 font-bold">
            {header}
          </div>

          {/* ⚪ ISI MODAL */}
          <div className="px-16 py-5 text-center space-y-4">
            {/* 🟢 JUDUL UTAMA */}
            <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>

            {/* 🟡 FORM INPUT */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tahun</label>
                <input
                  type="text"
                  value={tahun}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,4}$/.test(val)) {
                      setTahun(val);
                    }
                  }}
                  placeholder="Contoh: 2025"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Contoh: Ganjil, Genap, Genapppp"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | '')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                    <option value="">Pilih Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </form>

            {/* 🔘 BUTTON */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
              >
                Batal
              </Button>
              <Button
                className="px-10"
                variant="primary"
                onClick={() => handleSubmit(new Event('submit') as any)}
              >
                Simpan
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}