// src/components/AssessmentPeriodDropdown.tsx

import { useState, useEffect } from "react";
import { useAssessmentPeriod } from "@/hooks/useAssessmentPeriod";
import { AssessmentPeriodResponseDto } from "@/interfaces/assessment-period";

interface AssessmentPeriodDropdownProps {
  value?: number | null;
  onChange: (id: number | null) => void;
  onlyActive?: boolean; // Jika true, hanya tampilkan periode aktif
  placeholder?: string;
  className?: string;
}

export default function AssessmentPeriodDropdown({
  value,
  onChange,
  onlyActive = false,
  placeholder = "Pilih periode penilaian...",
  className = "",
}: AssessmentPeriodDropdownProps) {
  const { list, getActive, loading, error } = useAssessmentPeriod();
  const [periods, setPeriods] = useState<AssessmentPeriodResponseDto[]>([]);

  // Load data saat komponen mount
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        if (onlyActive) {
          const activePeriods = await getActive();
          setPeriods(activePeriods);
        } else {
          const response = await list();
          setPeriods(response.data); // karena list() return AssessmentPeriodListResponseDto
        }
      } catch (err) {
        // Error sudah ditangani di hook, tapi kita biarkan state kosong
        setPeriods([]);
      }
    };

    loadPeriods();
  }, [list, getActive, onlyActive]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    onChange(id);
  };

  // Format semester & tahun
  const formatPeriod = (period: AssessmentPeriodResponseDto) => {
    const semesterMap: Record<string, string> = {
      Ganjil: "Ganjil",
      Genap: "Genap",
    };
    const statusLabel = period.status === "active" ? " (Aktif)" : "";
    return `${period.year} - ${semesterMap[period.semester] || period.semester}${statusLabel}`;
  };

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={handleChange}
        disabled={loading}
        className={`w-full p-2 border rounded-md bg-white ${
          loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {formatPeriod(period)}
          </option>
        ))}
      </select>

      {loading && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">
          Gagal memuat periode penilaian
        </p>
      )}
    </div>
  );
}