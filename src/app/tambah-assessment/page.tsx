'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';

export default function Page() {
  const router = useRouter();

  // State form
  const [tipeSoal, setTipeSoal] = useState('');
  const [status, setStatus] = useState('');

  const handleTipeSoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;

    // Navigasi ke halaman berdasarkan tipe soal
    switch (selectedType) {
      case 'Pilihan Jawaban':
        router.push('/pilih-jawaban');
        break;
      case 'API dari iGracias':
        router.push('/api-igracias');
        break;
      case 'Submit Jawaban Excel':
        router.push('/submit-excel');
        break;
      default:
        break;
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
            {/* Form */}
            <form>
              {/* Tipe Soal & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type Soal</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    value={tipeSoal}
                    onChange={handleTipeSoalChange}
                  >
                    <option value="">Pilih Type Soal</option>
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-red-500 rounded-lg flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a1 1 0 00-1.41 1.41L10.07 11l-5.94 5.94a1 1 0 001.41 1.41l6-6a1 1 0 000-1.41l-6-6z" />
                  </svg>
                  Batal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M19.71 9.22a1 1 0 01.29-.8l.01-.01a1 1 0 011.42 1.42l-4.83 4.83a1 1 0 01-1.42 0l-4.83-4.83a1 1 0 011.42-1.42l.01.01a1 1 0 01-.29.8l4.75 4.75a.5.5 0 00.7-.04V14a1 1 0 012 0v2.13a.5.5 0 00.7.04l4.75-4.75a1 1 0 01.29-.8zM12 15.75h.01c3.16 0 5.99-2.53 5.99-5.99V4.87a1 1 0 00-1.41-.71l-7 7a1 1 0 000 1.42l7 7A1 1 0 0018 18v-2.13a.5.5 0 00-.7-.04L12 15.75zm-4.4 3.29l1.4-1.4a1 1 0 00-1.4-1.4l-1.4 1.4a1 1 0 000 1.41z" />
                  </svg>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}