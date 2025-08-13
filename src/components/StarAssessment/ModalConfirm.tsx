'use client';

import { Dialog } from '@headlessui/react';
import Button from "@/components/button";

interface ModalConfirmProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  header?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideDefaultButtons?: boolean;
  hideHeader?: boolean;
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
  hideDefaultButtons = false,
}: ModalConfirmProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        {/* 🔹 Lebar sedikit lebih kecil */}
        <Dialog.Panel className="bg-white rounded-md shadow-xl w-full max-w-xl mx-4 overflow-hidden">
          
          {/* 🔵 HEADER BIRU */}
          <div className="bg-blue-800 text-white px-6 py-3 font-bold">
            {header}
          </div>

          {/* ⚪ ISI MODAL */}
          <div className="px-16 py-5 text-center space-y-4">
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
            {!hideDefaultButtons && (
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
                >
                  {cancelLabel}
                </Button>
                <Button
                  className="px-8"
                  variant="primary"
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
