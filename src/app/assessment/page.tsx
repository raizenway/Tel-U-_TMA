"use client";

import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCreateAssessment } from "@/hooks/useAssessment";
import { useState } from "react";

const campusToPeriodeId: Record<string, number> = {
  "Tel-U Jakarta": 1,
  "Tel-U Surabaya": 2,
  "Tel-U Purwokerto": 3,
};

const campuses = [
  { name: "Tel-U Jakarta", image: "/image 2.png" },
  { name: "Tel-U Surabaya", image: "/image 2.png" },
  { name: "Tel-U Purwokerto", image: "/image 2.png" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { mutate, loading, error } = useCreateAssessment();
  const [submittingCampus, setSubmittingCampus] = useState<string | null>(null);

  const handleSelectCampus = async (campus: string) => {
    const periodeId = campusToPeriodeId[campus];
    if (periodeId === undefined) {
      console.error("PeriodeId tidak ditemukan untuk kampus:", campus);
      return;
    }

    setSubmittingCampus(campus);
    try {
      // ✅ Hanya kirim periodeId — userId diisi oleh backend
    await mutate({
   periodId: periodeId, 
  userId: 1, // hardcode sementara atau ambil dari auth
  submission_date: "2025-08-15", // atau new Date().toISOString().split('T')[0]
});

      // Redirect sesuai kampus
      if (campus === "Tel-U Purwokerto") {
        router.push("/assessment/assessment-form");
      } else if (campus === "Tel-U Jakarta") {
        router.push("/assessment/jakarta");
      } else if (campus === "Tel-U Surabaya") {
        router.push("/assessment/Surabaya");
      }
    } catch (err) {
      console.error("Gagal membuat assessment:", err);
    } finally {
      setSubmittingCampus(null);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 p-10 space-y-10">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md max-w-2xl">
            Gagal membuat assessment: {error}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {campuses.map((campus) => (
            <div
              key={campus.name}
              className="w-[300px] sm:w-[380px] md:w-[420px] lg:w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <Image
                src={campus.image}
                alt={campus.name}
                width={243}
                height={107}
                priority
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {campus.name}
              </h3>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleSelectCampus(campus.name)}
                disabled={loading || submittingCampus === campus.name}
                className="rounded-[12px] px-17 py-2 text-sm font-semibold"
              >
                {submittingCampus === campus.name ? "Memuat..." : "Pilih"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}