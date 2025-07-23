'use client';

import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ModalConfirmProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  warningTitle?: string;
  warningMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ModalConfirm({
  isOpen,
  onCancel,
  onConfirm,
  title,
  message,
  warningTitle = '',
  warningMessage = '',
  confirmLabel = 'Ya, saya yakin',
  cancelLabel = 'Batal',
}: ModalConfirmProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-blue-800 text-white px-6 py-3 font-bold">
            {title}
          </div>

          <div className="px-6 py-5 text-center space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              {message}
            </Dialog.Title>

            {warningMessage && (
              <div className="flex items-start gap-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-sm text-yellow-800 rounded">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-bold">{warningTitle}</p>
                  <p>{warningMessage}</p>
                </div>
              </div>
            )}

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