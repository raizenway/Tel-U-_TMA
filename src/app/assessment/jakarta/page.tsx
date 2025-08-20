"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalBlockNavigation from "@/components/ModalBlockNavigation";
import JakartaTab from "../../../components/JakartaTab";

export default function AssessmentJakartaPage() {
  const router = useRouter();

  const [tab, setTab] = useState("assessment-form"); // bisa dikembangkan jika ada multiple tab
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNavItem, setPendingNavItem] = useState<any>(null);

  // Handler saat klik item di sidebar
  const handleNavItemClick = (item: any) => {
    if (isFormDirty) {
      setPendingNavItem(item);
      setIsModalOpen(true);
    } else {
      navigateTo(item);
    }
  };

  // Fungsi navigasi
  const navigateTo = (item: any) => {
    if (item.externalLink) {
      window.location.href = item.externalLink;
    } else if (item.value) {
      setTab(item.value);
    } else if (item.path) {
      router.push(`/${item.path}`);
    }
  };

  // Konfirmasi navigasi
  const handleConfirmNavigation = () => {
    if (pendingNavItem) {
      setIsModalOpen(false);
      setIsFormDirty(false);
      navigateTo(pendingNavItem);
      setPendingNavItem(null);
    }
  };

  // Batalkan navigasi
  const handleCancelNavigation = () => {
    setIsModalOpen(false);
    setPendingNavItem(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          {tab === "assessment-form" && (
            <JakartaTab setIsFormDirty={setIsFormDirty} />
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