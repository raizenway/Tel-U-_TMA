"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import TopbarHeader from "@/components/TopbarHeader";
import PurwokertoTab from "@/components/PurwokertoTab";
import ModalBlockNavigation from "@/components/ModalBlockNavigation";

export default function AssessmentFormPage() {
  const router = useRouter();

  const [tab, setTab] = useState("assessment-form");
  const [isFormDirty, setIsFormDirty] = useState(false); // ✅ hanya satu kali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNavItem, setPendingNavItem] = useState<any>(null);

  // Saat user klik menu sidebar
  const handleNavItemClick = (item: any) => {
    if (isFormDirty) {
      setPendingNavItem(item); // simpan dulu kemana mau pergi
      setIsModalOpen(true);    // buka modal konfirmasi
    } else {
      navigateTo(item);        // langsung navigasi
    }
  };

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
      <Sidebar onItemClick={handleNavItemClick} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="px-6 pt-6 bg-white shadow">
          <TopbarHeader />
        </div>

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
