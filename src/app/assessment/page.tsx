"use client";

import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCreateAssessment } from "@/hooks/useAssessment";
import { useAssessmentPeriod } from "@/hooks/useAssessmentPeriod";
import { AssessmentPeriodResponseDto } from "@/interfaces/assessment-period";
import { useState, useEffect, useMemo } from "react";

// Mapping branchId → nama kampus
const branchIdToCampus: Record<number, string> = {
  1: "Tel-U Bandung",
  2: "Tel-U Jakarta",
  3: "Tel-U Surabaya",
  4: "Tel-U Purwokerto",
};

// Data kampus untuk tampilan gambar
const allCampuses = [
  { name: "Tel-U Bandung", image: "/image 2.png" },
  { name: "Tel-U Jakarta", image: "/image 2.png" },
  { name: "Tel-U Surabaya", image: "/image 2.png" },
  { name: "Tel-U Purwokerto", image: "/image 2.png" },
];

// Mapping branchId → rute assessment
const branchIdToRoute: Record<number, string> = {
  1: "Bandung",
  2: "Jakarta",
  3: "Surabaya",
  4: "assessment-form",
};

export default function AssessmentPage() {
  const router = useRouter();
  const { mutate, loading: isCreating, error } = useCreateAssessment();
  const { list, loading: loadingPeriodsFromHook } = useAssessmentPeriod();

  const [submittingCampus, setSubmittingCampus] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [allPeriods, setAllPeriods] = useState<AssessmentPeriodResponseDto[]>([]);

  // Ambil user dari localStorage
  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Redirect ke login jika belum login
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Ambil daftar periode
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

    if (user) fetchPeriods();
  }, [list, user]);

  // ✅ LOGIKA AKSES: Super User vs Admin Kampus
  const campusesToShow = useMemo(() => {
    if (!user) return [];

    // Pastikan role.id ada
    const roleId = user.role?.id ?? user.roleId; // support dua format

    // Jika Super User (role.id === 1)
    if (roleId === 1) {
      return allCampuses;
    }

    // Jika Admin Kampus (role.id === 2)
    const branchId = user.branchId;
    if (!branchId) return [];

    const campusName = branchIdToCampus[branchId];
    if (!campusName) return [];

    return allCampuses.filter((c) => c.name === campusName);
  }, [user]);

  const getActivePeriods = () => {
    return allPeriods.filter((p) => p.status === "active");
  };

  const handleSelectCampus = (campus: string) => {
    setSelectedCampus(campus);
    setShowPeriodModal(true);
  };

  const handleSelectPeriod = async (periodId: number) => {
    if (!selectedCampus || !user) return;

    let userId: number;
    let branchId: number;

    const roleId = user.role?.id ?? user.roleId;

    if (roleId === 1) {
      // Super User: gunakan ID user sendiri (misal id=1), tapi branchId diambil dari kampus yang dipilih
      userId = user.id;
      const foundEntry = Object.entries(branchIdToCampus).find(
        ([, name]) => name === selectedCampus
      );
      if (!foundEntry) {
        alert("Kampus tidak dikenali.");
        return;
      }
      branchId = parseInt(foundEntry[0], 10);
    } else {
      // Admin biasa
      userId = user.id;
      branchId = user.branchId;
    }

    setSubmittingCampus(selectedCampus);
    setShowPeriodModal(false);

    try {
      const response = await mutate({
        periodId,
        userId,
        branchId,
        submission_date: new Date().toISOString().split("T")[0],
      });

      const assessmentId = response?.id;
      if (!assessmentId) {
        throw new Error("Assessment ID tidak ditemukan dalam respons");
      }

      const routeSuffix = branchIdToRoute[branchId];
      if (!routeSuffix) {
        alert("Rute untuk kampus ini belum dikonfigurasi.");
        return;
      }

      router.push(`/assessment/${routeSuffix}?assessmentId=${assessmentId}`);
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

  if (!user) {
    return null;
  }

  if (campusesToShow.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">Anda tidak memiliki akses ke assessment.</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Kembali ke Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-10 space-y-10">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md max-w-2xl">
            Gagal membuat assessment: {error}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {campusesToShow.map((campus) => (
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
                disabled={
                  isCreating ||
                  submittingCampus === campus.name ||
                  loadingPeriodsFromHook
                }
                className="rounded-[12px] px-6 py-2 text-sm font-semibold"
              >
                {loadingPeriodsFromHook || submittingCampus === campus.name
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
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            {loadingPeriodsFromHook ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Memuat periode...
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {getActivePeriods().length > 0 ? (
                  getActivePeriods().map((period) => (
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
                    Tidak ada periode aktif.
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