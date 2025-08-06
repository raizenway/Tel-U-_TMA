// app/api-igracias/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';

export default function ApiIgraciasPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [linkApi, setLinkApi] = useState('');
  const [indikator, setIndikator] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [status, setStatus] = useState('');
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

  // Validasi
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!linkApi.trim()) newErrors.linkApi = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan.trim()) newErrors.pertanyaan = 'Wajib diisi';
    if (!status) newErrors.status = 'Wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSimpan = () => {
  if (!validate()) return;

  const saved = localStorage.getItem('assessmentList');
  const list = saved ? JSON.parse(saved) : [];

  const baseData = {
    variable: namaVariabel,
    bobot: 1,
    indikator,
    pertanyaan,
    tipeSoal: 'API dari iGracias',
    status: status === 'Active' ? 'Active' : 'Inactive',
    deskripsiSkor0: deskripsiSkor[0],
    deskripsiSkor1: deskripsiSkor[1],
    deskripsiSkor2: deskripsiSkor[2],
    deskripsiSkor3: deskripsiSkor[3],
    deskripsiSkor4: deskripsiSkor[4],
  };

  let updated;
  const editData = localStorage.getItem('editData');

  if (editData) {
    const data = JSON.parse(editData);
    updated = list.map((item: any) =>
      item.nomor === data.nomor ? { ...item, ...baseData } : item
    );
    localStorage.removeItem('editData'); // ✅ BARU HAPUS DI SINI!
  } else {
    const lastNomor = list.length > 0 ? Math.max(...list.map((i: any) => i.nomor)) : 0;
    updated = [...list, { ...baseData, nomor: lastNomor + 1 }];
  }

  localStorage.setItem('assessmentList', JSON.stringify(updated));
  router.push('/daftar-assessment');
};

  // Redirect otomatis saat ganti tipe soal
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/submit-excel');
    }
  };

  // Load data untuk edit
  useEffect(() => {
  const editData = localStorage.getItem('editData');
  if (editData) {
    const data = JSON.parse(editData);
 setNamaVariabel(data.variable || '');
    setLinkApi(data.linkApi || '');
    setIndikator(data.indikator || '');
    setPertanyaan(data.pertanyaan || '');
    setStatus(data.status || 'Inactive');

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

     
    }
  }, []);

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white rounded-xl shadow-md mx-auto"
          style={{ width: '1100px', minHeight: '650px', margin: '0 auto' }}
        >
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Soal: API dari iGracias</h1>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            {/* Type Soal & Status */}
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

            {/* Nama Variabel & Link API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                <input
                  type="text"
                  className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={namaVariabel}
                  onChange={(e) => setNamaVariabel(e.target.value)}
                  placeholder="Masukkan Nama Variabel"
                />
                {errors.namaVariabel && <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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

            {/* Deskripsi Skor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder={`Masukkan deskripsi untuk skor ${skor}`}
                    rows={3}
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border-t bg-gray-50 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/daftar-assessment')}
              className="px-15 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <Button
              variant="primary"
              onClick={handleSimpan}
              className="px-15 py-2 text-white rounded-lg transition"
            >
              Simpan
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}