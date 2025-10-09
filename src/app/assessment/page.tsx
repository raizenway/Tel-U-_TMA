// app/assessment/page.tsx
"use client";

import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCreateAssessment } from "@/hooks/useAssessment";
import { useAssessmentPeriod } from "@/hooks/useAssessmentPeriod";
import { AssessmentPeriodResponseDto } from "@/interfaces/assessment-period";
import { useState, useEffect } from "react";

// 🔁 Sesuaikan ID periode sesuai kebutuhan di database
const campusToPeriodIds: Record<string, number[]> = {
  "Tel-U Jakarta": [1,2,3,4],
  "Tel-U Surabaya": [1,2,3,4],
  "Tel-U Purwokerto": [1,2,3,4], // ← Ganti ke [11] jika periode Purwokerto sekarang id=11
};

const campuses = [
  { name: "Tel-U Jakarta", image: "/image 2.png" },
  { name: "Tel-U Surabaya", image: "/image 2.png" },
  { name: "Tel-U Purwokerto", image: "/image 2.png" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { mutate, loading: isCreating, error } = useCreateAssessment();
  const { list, loading: loadingPeriodsFromHook } = useAssessmentPeriod();

  const [submittingCampus, setSubmittingCampus] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [allPeriods, setAllPeriods] = useState<AssessmentPeriodResponseDto[]>([]);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await list();
        let periods: AssessmentPeriodResponseDto[] = [];

        if (Array.isArray(response)) {
          periods = response;
        } else if (response && Array.isArray(response.data)) {
          periods = response.data;
        } else {
          console.warn("Struktur respons API tidak dikenali:", response);
          periods = [];
        }

        setAllPeriods(periods);
      } catch (err) {
        console.error("Gagal memuat periode:", err);
        setAllPeriods([]);
      }
    };

    fetchPeriods();
  }, [list]);

  const getPeriodsForCampus = (campus: string) => {
    const allowedIds = campusToPeriodIds[campus] || [];
    return allPeriods
      .filter((p) => allowedIds.includes(p.id))
      .filter((p) => p.status === 'active');
  };

  const handleSelectCampus = (campus: string) => {
    setSelectedCampus(campus);
    setShowPeriodModal(true);
  };

  const handleSelectPeriod = async (periodId: number) => {
    if (!selectedCampus) return;

    setSubmittingCampus(selectedCampus);
    setShowPeriodModal(false);

    try {
      // ✅ Panggil API untuk membuat assessment → dapatkan assessmentId
      const response = await mutate({
        periodId,
        userId: 1,
        submission_date: new Date().toISOString().split("T")[0],
      });

      // ✅ Ambil assessmentId dari respons
      // Sesuaikan dengan struktur API-mu: response.id atau response.data.id
   const assessmentId = response?.id;
      if (!assessmentId) {
        throw new Error("Respons API tidak mengandung assessmentId");
      }

      // ✅ Redirect ke halaman form dengan assessmentId
      if (selectedCampus === "Tel-U Purwokerto") {
        router.push(`/assessment/assessment-form?assessmentId=${assessmentId}`);
      } else if (selectedCampus === "Tel-U Jakarta") {
        router.push(`/assessment/jakarta?assessmentId=${assessmentId}`);
      } else if (selectedCampus === "Tel-U Surabaya") {
        router.push(`/assessment/Surabaya?assessmentId=${assessmentId}`);
      }
    } catch (err) {
      console.error("Gagal membuat assessment:", err);
      alert("Gagal memulai assessment. Silakan coba lagi.");
    } finally {
      setSubmittingCampus(null);
      setSelectedCampus(null);
    }
  };

  const formatPeriodName = (period: AssessmentPeriodResponseDto) => {
    return `${period.year} - ${period.semester}`;
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
                disabled={isCreating || submittingCampus === campus.name || loadingPeriodsFromHook}
                className="rounded-[12px] px-17 py-2 text-sm font-semibold"
              >
                {loadingPeriodsFromHook
                  ? "Memuat periode..."
                  : submittingCampus === campus.name
                  ? "Memuat..."
                  : "Pilih"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Pemilihan Periode */}
      {showPeriodModal && selectedCampus && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pilih Periode — {selectedCampus}
              </h3>
              <button
                onClick={() => {
                  setShowPeriodModal(false);
                  setSelectedCampus(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {loadingPeriodsFromHook ? (
              <p className="text-gray-500 text-sm py-4 text-center">Memuat periode...</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {getPeriodsForCampus(selectedCampus).length > 0 ? (
                  getPeriodsForCampus(selectedCampus).map((period) => (
                    <button
                      key={period.id}
                      onClick={() => handleSelectPeriod(period.id)}
                      disabled={submittingCampus === selectedCampus}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-sm font-medium disabled:opacity-60"
                    >
                      {formatPeriodName(period)}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    Tidak ada periode tersedia.
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPeriodModal(false);
                  setSelectedCampus(null);
                }}
                className="px-4 py-2"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}