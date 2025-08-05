'use client';

import { useState } from 'react';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';

export default function Page() {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    alert('Data disimpan!');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Contoh Modal Dinamis</h1>

      {/* Tombol Tampilkan Modal */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Tampilkan Modal
      </button>


<ModalConfirm
  isOpen={showModal}
  onCancel={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="apakah anda yakin?"
  header="Kembali ke Pilihan Bidang"
  confirmLabel="Ya, saya yakin"
  cancelLabel="Batal"
>
  {/* Isi kotak peringatan dinamis */}
  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-left text-sm">
    <div className="font-bold mb-1">⚠️ Peringatan</div>
    <div>Data yang sudah diubah tidak akan disimpan.</div>
  </div>
</ModalConfirm>
    </div>
  );
}
