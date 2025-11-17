"use client";

import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCreateAssessment } from "@/hooks/useAssessment";
import { useAssessmentPeriod } from "@/hooks/useAssessmentPeriod";
import { useListBranch } from "@/hooks/useBranch";
import { AssessmentPeriodResponseDto } from "@/interfaces/assessment-period";
import { useState, useEffect, useMemo } from "react";



export default function AssessmentPage() {
  const router = useRouter();
  const { mutate, loading: isCreating, error: createError } = useCreateAssessment();
  const { list, loading: loadingPeriodsFromHook } = useAssessmentPeriod();
  const { data: branchData, isLoading: loadingBranches, error: branchError } = useListBranch(0);

  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [submittingBranchId, setSubmittingBranchId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [allPeriods, setAllPeriods] = useState<AssessmentPeriodResponseDto[]>([]);

  // 🔐 Load user dari localStorage (client-only)
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    setUser(parsed);
    setIsLoadingUser(false);
  }, []);

  // 🔁 Redirect ke login jika tidak ada user
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/login");
    }
  }, [isLoadingUser, user, router]);

  // 📅 Load periode assessment
  useEffect(() => {
    if (!user || isLoadingUser) return;

    const fetchPeriods = async () => {
      try {
        const response = await list();
        let periods: AssessmentPeriodResponseDto[] = [];

        if (Array.isArray(response)) {
          periods = response;
        } else if (response && Array.isArray(response.data)) {
          periods = response.data;
        }
        setAllPeriods(periods);
      } catch (err) {
        console.error("Gagal memuat periode:", err);
        setAllPeriods([]);
      }
    };

    fetchPeriods();
  }, [list, user, isLoadingUser]);

  // 🏢 Ambil daftar cabang dari API (bukan hardcode!)
  const branches = useMemo(() => {
    if (!branchData?.data) return [];
    return branchData.data; // Sesuai struktur API Anda
  }, [branchData]);

  // 🎯 Filter cabang berdasarkan role user
  const branchesToShow = useMemo(() => {
    if (!user || loadingBranches || !branches.length) return [];

    const roleId = user.role?.id ?? user.roleId;
    if (roleId === 1) {
      return branches; // Admin: semua cabang
    }

    const userBranchId = user.branchId;
    if (!userBranchId) return [];

    const userBranch = branches.find((b: any) => b.id === userBranchId);
    return userBranch ? [userBranch] : [];
  }, [user, branches, loadingBranches]);

  const getActivePeriods = () => {
    return allPeriods.filter((p) => p.status === "active");
  };

  const handleSelectCampus = (branchId: number) => {
    setSelectedBranchId(branchId);
    setShowPeriodModal(true);
  };

  const handleSelectPeriod = async (periodId: number) => {
    if (selectedBranchId === null || !user) return;

    const roleId = user.role?.id ?? user.roleId;
    const userId = user.id;
    const branchId = selectedBranchId;

    setSubmittingBranchId(branchId);
    setShowPeriodModal(false);

    try {
      const response = await mutate({
        periodId,
        userId,
        branchId,
        submission_date: new Date().toISOString().split("T")[0],
      });

      const assessmentId = response?.id;
      if (!assessmentId) throw new Error("Assessment ID tidak ditemukan");

      router.push(`/assessment/${branchId}?assessmentId=${assessmentId}`);
    } catch (err) {
      console.error("Gagal membuat assessment:", err);
      alert("Gagal memulai assessment. Silakan coba lagi.");
    } finally {
      setSubmittingBranchId(null);
      setSelectedBranchId(null);
    }
  };

  const formatPeriodName = (period: AssessmentPeriodResponseDto) => {
    return `${period.year} - ${period.semester}`;
  };

  // === RENDERING ===

  if (isLoadingUser || loadingBranches) {
    return (
      <div className="flex">
        <div className="flex-1 p-10 space-y-10">
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[380px] md:w-[420px] lg:w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex">
        <div className="flex-1 p-10">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="p-10 text-red-600">
        Gagal memuat daftar kampus: {branchError.message}
      </div>
    );
  }

  if (branchesToShow.length === 0) {
    return (
      <div className="flex">
        <div className="p-10 text-center">
          <p className="text-red-600">Anda tidak memiliki akses ke assessment.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 p-10 space-y-10">
            {createError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md max-w-2xl">
          Gagal membuat assessment: {createError}
        </div>
      )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {branchesToShow.map((branch: any) => (
            <div
              key={branch.id}
              className="w-[300px] sm:w-[380px] md:w-[420px] lg:w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <Image
                src="/image 2.png"
                alt={branch.name}
                width={243}
                height={107}
                priority
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {branch.name}
              </h3>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => handleSelectCampus(branch.id)}
                disabled={
                  isCreating ||
                  submittingBranchId === branch.id ||
                  loadingPeriodsFromHook
                }
                className="rounded-[12px] px-6 py-2 text-sm font-semibold"
              >
                {loadingPeriodsFromHook || submittingBranchId === branch.id
                  ? "Memuat..."
                  : "Pilih"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {showPeriodModal && selectedBranchId !== null && (
      <div 
  className="fixed inset-0 bg-tranfarant bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pilih Periode —{" "}
                {
                  branches.find((b: any) => b.id === selectedBranchId)?.name
                }
              </h3>
              <button
                onClick={() => {
                  setShowPeriodModal(false);
                  setSelectedBranchId(null);
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
                      disabled={submittingBranchId === selectedBranchId}
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
                  setSelectedBranchId(null);
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