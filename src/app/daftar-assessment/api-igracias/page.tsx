'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import { X, Save } from 'lucide-react';

// Interface untuk data assessment
interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  tipeSoal: string;
  status: 'Active' | 'Inactive';
  pertanyaan: string;
  linkApi: string;
  deskripsiSkor0: string;
  deskripsiSkor1: string;
  deskripsiSkor2: string;
  deskripsiSkor3: string;
  deskripsiSkor4: string;
  urutan: number;
}

// Type untuk status input di UI
type StatusInput = 'Aktif' | 'Non-Aktif';

export default function ApiIgraciasPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [linkApi, setLinkApi] = useState('');
  const [indikator, setIndikator] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [urutan, setUrutan] = useState<string>('');
  const [deskripsiSkor, setDeskripsiSkor] = useState<{
    [key: number]: string;
  }>({
    0: 'Tidak ada dokumentasi.',
    1: 'Ada dokumentasi dasar.',
    2: 'Dokumentasi sebagian lengkap.',
    3: 'Dokumentasi hampir lengkap.',
    4: 'Dokumentasi lengkap dan terupdate.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // Load data dari editData
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (!editData) return;

    try {
      const data = JSON.parse(editData);

      setNamaVariabel(data.variable || '');
      setLinkApi(data.linkApi || '');
      setIndikator(data.indikator || '');
      setPertanyaan(data.pertanyaan || '');
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setUrutan(data.urutan ? String(data.urutan) : '');

      if (data.deskripsiSkor) {
        setDeskripsiSkor(data.deskripsiSkor);
      } else if (data.deskripsiSkor0 !== undefined) {
        setDeskripsiSkor({
          0: data.deskripsiSkor0,
          1: data.deskripsiSkor1,
          2: data.deskripsiSkor2,
          3: data.deskripsiSkor3,
          4: data.deskripsiSkor4,
        });
      }

      // Tentukan mode: hanya edit jika ada nomor
      if (data.nomor !== undefined && data.nomor !== null && data.nomor !== '') {
        setEditNomor(data.nomor);
        setIsEditMode(true);
      } else {
        setEditNomor(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
    }
  }, []);

  // Validasi
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!linkApi.trim()) newErrors.linkApi = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan.trim()) newErrors.pertanyaan = 'Wajib diisi';
    if (!status) newErrors.status = 'Wajib dipilih';
    if (!urutan || isNaN(parseFloat(urutan)) || parseFloat(urutan) < 1) {
      newErrors.urutan = 'Urutan harus angka dan > 0';
    }

    Object.keys(deskripsiSkor).forEach((level) => {
      const numLevel = Number(level);
      if (!deskripsiSkor[numLevel]?.trim()) {
        newErrors[`deskripsiSkor${numLevel}`] = 'Wajib diisi';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cek validasi untuk disable button
  const isFormValid = () => {
    return (
      namaVariabel.trim() !== '' &&
      linkApi.trim() !== '' &&
      indikator.trim() !== '' &&
      pertanyaan.trim() !== '' &&
      status !== '' &&
      urutan !== '' &&
      !isNaN(parseFloat(urutan)) &&
      parseFloat(urutan) >= 1
    );
  };

  const handleSimpan = () => {
    if (!validate()) return;

    try {
      const saved = localStorage.getItem('assessmentList');
      let list: AssessmentItem[] = saved ? JSON.parse(saved) : [];

      // ✅ Konversi status UI → status data dengan tipe yang benar
      const finalStatus: 'Active' | 'Inactive' =
        status === 'Aktif' ? 'Active' : 'Inactive';

      const baseData = {
        variable: namaVariabel,
        bobot: 1,
        indikator,
        pertanyaan,
        tipeSoal: 'API dari iGracias',
        status: finalStatus, // ✅ tipe aman
        linkApi,
        deskripsiSkor0: deskripsiSkor[0],
        deskripsiSkor1: deskripsiSkor[1],
        deskripsiSkor2: deskripsiSkor[2],
        deskripsiSkor3: deskripsiSkor[3],
        deskripsiSkor4: deskripsiSkor[4],
        urutan: parseInt(urutan, 10),
      };

      let updated: AssessmentItem[];

      if (isEditMode && editNomor !== null) {
        updated = list.map((item) =>
          item.nomor === editNomor ? { ...item, ...baseData } : item
        );
      } else {
        const lastNomor = list.length > 0 ? Math.max(...list.map((item) => item.nomor)) : 0;
        updated = [...list, { ...baseData, nomor: lastNomor + 1 }];
      }

      // ✅ Simpan ke localStorage
      localStorage.setItem('assessmentList', JSON.stringify(updated));
      localStorage.setItem('newDataAdded', 'true');
      localStorage.removeItem('editData');

      // ✅ Redirect
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      alert('Gagal menyimpan data. Cek console untuk detail.');
    }
  };

  // Redirect saat ganti tipe soal
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assessment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white rounded-xl shadow-md mx-auto"
          style={{ width: '1100px', minHeight: '650px', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Soal: API dari iGracias' : 'Soal Baru: API dari iGracias'}
            </h1>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            {/* Type Soal & Link API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type Soal</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  onChange={handleTypeChange}
                  defaultValue="api-igracias"
                >
                  <option value="">Pilih Type Soal</option>
                  <option value="pilihan-jawaban">Pilihan Jawaban</option>
                  <option value="api-igracias">API dari iGracias</option>
                  <option value="submit-excel">Submit Jawaban Excel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link API</label>
                <input
                  type="text"
                  className={`w-full border ${errors.linkApi ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={linkApi}
                  onChange={(e) => setLinkApi(e.target.value)}
                  placeholder="Masukkan Link API"
                />
                {errors.linkApi && <p className="text-red-500 text-xs mt-1">{errors.linkApi}</p>}
              </div>
            </div>

            {/* Nama Variabel & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                <select
                  className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 bg-white`}
                  value={namaVariabel}
                  onChange={(e) => setNamaVariabel(e.target.value)}
                  aria-label="Nama Variabel"
                >
                  <option value="" disabled>
                    Pilih Nama Variabel
                  </option>
                  <option value="Akademisi">Akademisi</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Kemahasiswaan">Kemahasiswaan</option>
                  <option value="Kerjasama">Kerjasama</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Mahasiswa Asing">Mahasiswa Asing</option>
                  <option value="Mutu">Mutu</option>
                  <option value="SDM">SDM</option>
                  <option value="PPM, Publikasi, HKI">PPM, Publikasi, HKI</option>
                </select>
                {errors.namaVariabel && (
                  <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusInput)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Aktif">Active</option>
                  <option value="Non-Aktif">Inactive</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* Indikator & Pertanyaan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Indikator</label>
                <textarea
                  className={`w-full border ${errors.indikator ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={indikator}
                  onChange={(e) => setIndikator(e.target.value)}
                  placeholder="Masukkan Indikator"
                  rows={4}
                ></textarea>
                {errors.indikator && <p className="text-red-500 text-xs mt-1">{errors.indikator}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                <textarea
                  className={`w-full border ${errors.pertanyaan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Masukkan Pertanyaan"
                  rows={4}
                ></textarea>
                {errors.pertanyaan && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan}</p>}
              </div>
            </div>

            {/* Urutan & Deskripsi Skor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <input
                  type="number"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  className={`w-full border ${errors.urutan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  placeholder="Masukkan urutan"
                  min="1"
                />
                {errors.urutan && <p className="text-red-500 text-xs mt-1">{errors.urutan}</p>}
              </div>
              {[0, 1, 2, 3, 4].map((skor) => (
                <div key={skor}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Skor {skor}</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    value={deskripsiSkor[skor]}
                    onChange={(e) =>
                      setDeskripsiSkor((prev) => ({
                        ...prev,
                        [skor]: e.target.value,
                      }))
                    }
                    placeholder={`Deskripsi untuk skor ${skor}`}
                    rows={3}
                  ></textarea>
                  {errors[`deskripsiSkor${skor}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`deskripsiSkor${skor}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="p-8 border-t bg-gray-50 flex justify-end gap-4">
            <Button
              variant="ghost"
              icon={X}
              iconColor="text-red-600"
              iconPosition="left"
              onClick={handleCancel}
              className="rounded-[12px] px-20 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="primary" // ✅ Ganti dari "simpan" ke "primary"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              disabled={!isFormValid()} // ✅ Disable jika form tidak valid
              className="rounded-[12px] px-25 py-2 text-sm font-semibold"
            >
              Simpan
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}