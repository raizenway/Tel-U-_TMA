"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PurwokertoTab from "@/components/PengsisianAssessment";
import ModalBlockNavigation from "@/components/ModalBlockNavigation";

export default function AssessmentFormPage() {
  const router = useRouter();

  const [tab, setTab] = useState("assessment-form");
  const [, setIsFormDirty] = useState(false); // ✅ hanya satu kali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNavItem, setPendingNavItem] = useState<any>(null);




  // Fungsi navigasi (pindah tab atau halaman)
  const navigateTo = (item: any) => {
    if (item.externalLink) {
      window.location.href = item.externalLink;
    } else if (item.value) {
      setTab(item.value); // ganti tab
    } else if (item.path) {
      router.push(`/${item.path}`); // pindah halaman
    }
  };

  // Lanjut navigasi setelah konfirmasi
  const handleConfirmNavigation = () => {
    if (pendingNavItem) {
      setIsModalOpen(false);
      setIsFormDirty(false); // reset form dirty
      navigateTo(pendingNavItem);
      setPendingNavItem(null);
    }
  };

  // Batal navigasi
  const handleCancelNavigation = () => {
    setIsModalOpen(false);
    setPendingNavItem(null);
  };

 

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* CONTENT */}
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          {tab === "assessment-form" && (
            <PurwokertoTab setIsFormDirty={setIsFormDirty} />
          )}
        </main>
      </div>

      {/* MODAL BLOKIR NAVIGASI */}
      <ModalBlockNavigation
        isOpen={isModalOpen}
        onCancel={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </div>
  );
}
