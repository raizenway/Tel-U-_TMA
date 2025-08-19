"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const campuses = [
  { name: "Tel-U Jakarta", image: "/image 2.png" },
  { name: "Tel-U Surabaya", image: "/image 2.png" },
  { name: "Tel-U Purwokerto", image: "/image 2.png" },
];

export default function AssessmentPage() {
  const router = useRouter();

  // ================================
  // STATE UNTUK MODAL KONFIRMASI
  // ================================
  const [isFormDirty, setIsFormDirty] = useState(false); // ← contoh
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingNavItem, setPendingNavItem] = useState<any>(null);

  // ====================
  // FUNGSI NAVIGASI
  // ====================
  const navigateTo = (item: any) => {
    // Lakukan logika navigasi
    router.push(item.href || "/welcome"); // Sesuaikan struktur item kamu
  };

  const handleNavItemClick = (item: any) => {
    if (isFormDirty) {
      setPendingNavItem(item);
      setIsModalOpen(true);
    } else {
      navigateTo(item);
    }
  };

  const handleSelectCampus = (campus: string) => {
    if (campus === "Tel-U Purwokerto") {
      router.push("/assessment/assessment-form");
    } else if (campus === "Tel-U Jakarta") {
      router.push("/assessment/jakarta");
    } else if (campus === "Tel-U Surabaya") {
      router.push("/assessment/surabaya");
    }
    // Tidak perlu alert lagi
  };

  return (
    <div className="flex">
      <div className="flex-1 p-10 space-y-10">
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {campuses.map((campus) => (
            <div
              key={campus.name}
              className="w-[300px] sm:w-[380px] md:w-[420px] lg:w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <Image src={campus.image} alt={campus.name} width={243} height={107} priority />
              <h3 className="text-lg font-semibold text-gray-800">{campus.name}</h3>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleSelectCampus(campus.name)}
                className="rounded-[12px] px-17 py-2 text-sm font-semibold"
              >
                Pilih
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}