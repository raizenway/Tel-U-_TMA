// components/SuccessNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import clsx from "clsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function SuccessNotification({ isOpen, onClose, message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Delay close to finish animation
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !visible) return null;

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center gap-2 text-white transition-all duration-300 ease-in-out",
        {
          "opacity-100 scale-100 bg-green-600": visible,
          "opacity-0 scale-95 pointer-events-none": !visible,
        }
      )}
    >
      <CheckCircle className="w-5 h-5" />
      <span>{message || "Berhasil mengirim assessment!"}</span>
    </div>
  );
}
