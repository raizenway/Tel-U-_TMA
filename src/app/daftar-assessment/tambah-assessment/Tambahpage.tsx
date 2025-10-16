'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TambahAssessmentPage() {
  const router = useRouter();
  const [tipeSoal, setTipeSoal] = useState('');
  const [status, setStatus] = useState('Active'); // ✅ default 'Active'

  // ✅ Hapus editData saat komponen mount (extra safety)
  useEffect(() => {
    localStorage.removeItem('editData');
  }, []);

  const handleTipeSoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTipeSoal(selectedType);

    if (!selectedType) return;

    // ✅ Pastikan status selalu ada
    const finalStatus = status || 'Active';

    const newData = {
      nomor: '',
      variable: '',
      bobot: 1,
      indikator: '',
      pertanyaan: '',
      deskripsiSkor0: '',
      deskripsiSkor1: '',
      deskripsiSkor2: '',
      deskripsiSkor3: '',
      deskripsiSkor4: '',
      minScore0: '',
      maxScore0: '',
      minScore1: '',
      maxScore1: '',
      minScore2: '',
      maxScore2: '',
      minScore3: '',
      maxScore3: '',
      minScore4: '',
      maxScore4: '',
      tipeSoal: selectedType,
      status: finalStatus,
    };

    

    // Redirect
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
    <div className="flex">
      <main className="flex-1">
        <div className="bg-white p-8 rounded-xl shadow-md">
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
                  {/* ✅ Hilangkan opsi kosong */}
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