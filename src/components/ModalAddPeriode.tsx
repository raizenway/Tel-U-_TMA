'use client';

import { Dialog } from '@headlessui/react';
import Button from "@/components/button";
import { useState } from 'react';
import { validatePeriodeForm } from '@/lib/api-periode';

interface ModalAddPeriodeProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (data: { 
  tahun: number; 
  semester: string;   // ✅ DARI number JADI string
   status: 'active' | 'inactive' | ''  
  }) => void;
  title: string;
  header?: string;
  periodes: { tahun: number; semester: string }[];
}

export default function ModalAddPeriode({
  isOpen,
  onCancel,
  onConfirm,
  title,
  header = "Tambah Periode",
  periodes,
}: ModalAddPeriodeProps) {
  const [tahun, setTahun] = useState<string>(''); // 👈 kosong
  const [semester, setSemester] = useState<string>(''); // 👈 kosong
  const [status, setStatus] = useState<'active' | 'inactive' | ''>(''); 
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error sebelum validasi
    setErrorMessage('');

    // Validasi tahun
    if (!/^\d{4}$/.test(tahun)) {
      setErrorMessage("Tahun harus 4 digit angka (contoh: 2025)");
      return;
    }

    const yearNum = parseInt(tahun);
    if (yearNum < 2000 || yearNum > 2100) {
      setErrorMessage("Tahun harus antara 2000 - 2100");
      return;
    }

    // Validasi semester
    if (semester !== 'Ganjil' && semester !== 'Genap') {
      setErrorMessage("Semester harus 'Ganjil' atau 'Genap'");
      return;
    }

    // Validasi status
    if (status === '') {
      setErrorMessage("Status harus dipilih");
      return;
    }

    // ✅ Cek duplikasi lokal
    const existing = periodes.find(p => 
      p.tahun === yearNum && p.semester === semester
    );

    if (existing) {
      setErrorMessage(`Periode ${yearNum} Semester ${semester} sudah ada!`);
      return;
    }

    // Jika semua valid, submit
    onConfirm({
      tahun: yearNum,
      semester,
      status: status as 'active' | 'inactive'
    });
  };

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
                    setErrorMessage('');
                  }
                }}
                placeholder="Contoh: 2025"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setErrorMessage(''); // 👈 RESET ERROR
                }}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Pilih Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as 'active' | 'inactive');
                  setErrorMessage(''); // 👈 RESET ERROR
                }}
                required // 👈 tambahkan ini biar wajib dipilih
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Pilih Status</option> {/* 👈 tambahkan ini */}
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </form>

          {/* ✅ PESAN ERROR */}
          {errorMessage && (
            <div className="text-red-600 text-sm mt-1">
              {errorMessage}
            </div>
          )}

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
              className={`px-10 ${errorMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="primary"
              onClick={() => handleSubmit(new Event('submit') as any)}
              disabled={!!errorMessage}
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