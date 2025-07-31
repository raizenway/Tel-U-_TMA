// components/SuccessNotification.tsx
"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function SuccessNotification({ isOpen, onClose, message }: Props) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-900 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
      <CheckCircle className="w-5 h-5" />
      <span>{message || "Berhasil mengirim assessment!"}</span>
    </div>
  );
}
