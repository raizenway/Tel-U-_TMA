'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TambahAssessmentPage() {
  const router = useRouter();
  const [tipeSoal, setTipeSoal] = useState('');
  const [status, setStatus] = useState('');

  const handleTipeSoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTipeSoal(selectedType);

    if (!selectedType) return;

    // ✅ Hapus editData lama agar tidak bawa data sebelumnya
    localStorage.removeItem('editData');

    // ✅ Buat data baru kosong (opsional: bisa isi default)
    const newData = {
      nomor: '', // akan diisi saat submit
      variable: '',
      bobot: 1,
      indikator: '',
      pertanyaan: '',
      deskripsiSkor0: '',
      deskripsiSkor1: '',
      deskripsiSkor2: '',
      deskripsiSkor3: '',
      deskripsiSkor4: '',
      tipeSoal: selectedType,
      status: status || 'Active', // gunakan status atau default
    };

    // ✅ Simpan sebagai editData → agar form bisa baca
    // Tapi ini data BARU, bukan edit
    localStorage.setItem('editData', JSON.stringify(newData));

    // Redirect ke form
    switch (selectedType) {
      case 'Pilihan Jawaban':
        router.push('/daftar-assessment/pilih-jawaban');
        break;
      case 'API dari iGracias':
        router.push('/daftar-assessment/api-igracias');
        break;
      case 'Submit Jawaban Excel':
        router.push('/daftar-assessment/submit-excel');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white p-8 rounded-xl shadow-md mx-auto"
          style={{ width: '1100px', maxWidth: '100vw' }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Assessment Baru</h1>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={tipeSoal}
                  onChange={handleTipeSoalChange}
                >
                  <option value="">Pilih Tipe Soal</option>
                  <option value="Pilihan Jawaban">Pilihan Jawaban</option>
                  <option value="API dari iGracias">API dari iGracias</option>
                  <option value="Submit Jawaban Excel">Submit Jawaban Excel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}