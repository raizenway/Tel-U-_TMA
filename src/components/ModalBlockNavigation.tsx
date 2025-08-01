"use client";

import { Dialog } from "@headlessui/react";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ModalBlockNavigation({
  isOpen,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
    <Dialog.Title
      as="h3"
      className="text-lg font-semibold leading-6 text-gray-900"
    >
      Yakin ingin keluar?
    </Dialog.Title>
    <div className="mt-2">
      <p className="text-sm text-gray-500">
        Perubahan yang belum disimpan akan hilang. Tindakan ini tidak bisa dibatalkan.
      </p>
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
      >
        Batal
      </button>
      <button
        onClick={onConfirm}
        className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
      >
        Keluar
      </button>
    </div>
  </Dialog.Panel>
</div>


    </Dialog>
  );
}
