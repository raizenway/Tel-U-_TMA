'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';


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
      {/* Sidebar */}
      
        {/* Page Content */}
       <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div 
          className="bg-white p-8 rounded-xl shadow-md mx-auto" 
          style={{ width: '1100px', maxWidth: '100vw' }}
        >
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

              
            </form>
          </div>
        </main>
      </div>
  );
}