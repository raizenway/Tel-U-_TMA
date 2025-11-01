// src/components/ModalAddBranch.tsx
import React, { useState } from 'react';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import Button from '@/components/button';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (data: { name: string; email: string }) => Promise<void>;
}

export default function ModalAddBranch({ isOpen, onCancel, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setModalError(null); 
  setIsSubmitting(true);

  if (!name.trim()) {
    setModalError('Nama UPPS/KC wajib diisi');
    setIsSubmitting(false);
    return;
  }
  if (!email.trim()) {
    setModalError('Email wajib diisi');
    setIsSubmitting(false);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setModalError('Format email tidak valid');
    setIsSubmitting(false);
    return;
  }

  try {
    await onConfirm({ name: name.trim(), email: email.trim() });
    // Jika sukses, modal akan ditutup oleh page.tsx
  } catch (err) {
    setModalError((err as Error).message || 'Gagal menambahkan kampus cabang');
  } finally {
    setIsSubmitting(false); // 👈 PASTIKAN LOADING BERHENTI
  }
};

  return (
    <ModalConfirm
      isOpen={isOpen}
      onCancel={onCancel}
      title="Tambah Kampus Cabang"
      header="Tambah Kampus Cabang"
      footer={
        <div className="flex justify-center gap-4 mt-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="rounded-[2px] px-8 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2 text-sm font-medium"
          >
            {isSubmitting ? 'Menyimpan...' : 'Tambah'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left w-full px-6 py-4">
        <div>
        <label className="block text-sm font-medium mb-1">Nama UPPS/KC</label>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Nama UPPS/KC"
        />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Email"
          />
        </div>
        {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
      </div>
    </ModalConfirm>
  );
}