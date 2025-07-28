'use client';

import { Dialog } from '@headlessui/react';

interface ModalConfirmProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string; // ini tampilnya di bawah header
  header?: string; 
  confirmLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
}

export default function ModalConfirm({
  isOpen,
  onCancel,
  onConfirm,
  title,
  header, 
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  children,
}: ModalConfirmProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden">

          {/* 🔵 HEADER BIRU */}
          <div className="bg-blue-800 text-white px-6 py-3 font-bold">{header}</div>

          {/* ⚪ ISI MODAL */}
          <div className="px-6 py-5 text-center space-y-4">

            {/* 🟢 JUDUL UTAMA */}
            <Dialog.Title
              as="h3"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </Dialog.Title>

            {/* 🟡 ISI DINAMIS */}
            <div>{children}</div>

            {/* 🔘 BUTTON */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
