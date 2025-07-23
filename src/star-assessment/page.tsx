'use client';

import { useState } from 'react';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';

export default function StarAssessmentPage() {
  const [showModal, setShowModal] = useState(false);

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleConfirm = () => {
    alert('Data tidak disimpan. Kembali ke pilihan bidang!');
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Halaman Star Assessment</h1>

      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Tampilkan Modal
      </button>

      <ModalConfirm
  isOpen={showModal}
  onCancel={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="Kembali ke Pemilihan Bidang"
  message="Apakah Kamu Yakin?"
  warningTitle="⚠️ Peringatan"
  warningMessage="Data yang sudah diubah tidak akan disimpan."
  confirmLabel="Ya, saya yakin"
  cancelLabel="Batal"
/>

    </div>
  );
}