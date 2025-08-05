'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';

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
    0: 'Lorem ipsum dolor sit amet consectetur.',
    1: 'Lorem ipsum dolor sit amet consectetur.',
    2: 'Lorem ipsum dolor sit amet consectetur.',
    3: 'Lorem ipsum dolor sit amet consectetur.',
    4: 'Lorem ipsum dolor sit amet consectetur.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!validate()) {
      alert('Mohon lengkapi semua field yang wajib.');
      return;
    }

    // Ambil data dari localStorage
    const saved = localStorage.getItem('assessmentList');
    const list = saved ? JSON.parse(saved) : [];

    // Hitung nomor terakhir
    const lastNomor = list.length > 0 ? Math.max(...list.map((i: any) => i.nomor)) : 0;

    // Data baru
    const newItem = {
      nomor: lastNomor + 1,
      variable: namaVariabel,
      bobot: 1,
      indikator,
      pertanyaan,
      tipeSoal: 'API dari iGracias',
      status: status === 'Active' ? 'Active' : 'Inactive',
    };

    // Simpan ke localStorage
    const updated = [...list, newItem];
    localStorage.setItem('assessmentList', JSON.stringify(updated));

    alert('Data berhasil disimpan!');
    router.push('/daftar-assessment');
  };

  // 🔁 Handler untuk redirect otomatis saat pilih tipe soal
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onItemClick={(item) => item.path && router.push(`/${item.path}`)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <TopbarHeader />

        {/* Page Content */}
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Soal 2: API dari iGracias</h1>

            {/* Type Soal & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 🔹 Dropdown Type Soal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type Soal</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  onChange={handleTypeChange}
                  defaultValue="api-igracias" // Tetap di halaman ini saat load
                >
                  <option value="">Pilih Type Soal</option>
                  <option value="pilihan-jawaban">Pilihan Jawaban</option>
                  <option value="api-igracias">API dari iGracias</option>
                  <option value="submit-excel">Submit Jawaban Excel</option>
                </select>
              </div>

              {/* Status (tidak diubah posisinya) */}
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

            {/* Nama Variabel & Link API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            {/* Indikator & Pertanyaan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    placeholder="Masukkan Deskripsi Skor"
                    rows={4}
                  ></textarea>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Batal
              </button>
              <button
                type="button"
                onClick={handleSimpan}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Simpan
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}