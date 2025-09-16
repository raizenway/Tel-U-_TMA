"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import {
  useGetMaturityLevelById,
  useUpdateMaturityLevel,
} from "@/hooks/useMaturityLevel";
import { UpdateMaturityLevelRequest } from "@/interfaces/maturity-level";

export default function EditMaturityPage() {
  const { id } = useParams();
  const router = useRouter();
  const realId = Array.isArray(id) ? Number(id[0]) : Number(id);

  // Redirect jika ID tidak valid
  useEffect(() => {
    if (!realId || isNaN(realId)) {
      console.warn("Invalid ID, redirecting...");
      router.push("/maturity-level");
    }
  }, [realId, router]);

  if (!realId || isNaN(realId)) return null;

  // ✅ Hooks — gunakan nama unik untuk loading
  const { data: maturityDetail, loading: isLoadingDetail } = useGetMaturityLevelById(realId);
  const { mutate: updateMaturity, loading: isUpdating } = useUpdateMaturityLevel();

  // State
  const [formData, setFormData] = useState<UpdateMaturityLevelRequest>({
    id: realId,
    name: "",
    levelNumber: 0,
    minScore: 0,
    maxScore: 0,
    generalDescription: "",
    scoreDescription0: "",
    scoreDescription1: "",
    scoreDescription2: "",
    scoreDescription3: "",
    scoreDescription4: "",
  });

  // Debug: Log API response lengkap
  useEffect(() => {
    if (maturityDetail) {
      console.log("🚀 [API Response Lengkap]:", maturityDetail);
    }
  }, [maturityDetail]);

  // Load data dari API atau localStorage
  // ... bagian atas tetap sama ...

// Load data dari API atau localStorage
useEffect(() => {
  if (!maturityDetail || !realId) return;

  const tempKey = `maturityTempForm_${realId}`;
  const temp = localStorage.getItem(tempKey);

  if (temp) {
    try {
      const parsed = JSON.parse(temp);

      if (
        parsed &&
        typeof parsed === "object" &&
        "id" in parsed &&
        parsed.id === realId
      ) {
        console.log(`[LocalStorage] Restoring form for ID: ${realId}`);
        setFormData({
          ...parsed,
          id: realId,
        });
        return;
      } else {
        console.warn(
          `[LocalStorage] Ignored — ID mismatch or invalid structure. Expected: ${realId}, Got:`,
          parsed?.id
        );
        localStorage.removeItem(tempKey);
      }
    } catch (err) {
      console.error("[LocalStorage] Error parsing:", err);
      localStorage.removeItem(tempKey);
    }
  }

  // ✅ Casting ke `any` untuk akses snake_case tanpa error TypeScript
  const md = maturityDetail as any;

  // Helper: ambil nilai dengan fallback
  const getDesc = (key: string, fallbackKey?: string) => {
    const val = md[key] ?? md[fallbackKey || ''];
    return typeof val === 'string' ? val : '';
  };

  setFormData({
    id: md.id,
    name: md.name || "",
    levelNumber: md.levelNumber || md.level_number || 0,
    minScore: Number(md.minScore || md.min_score) || 0,
    maxScore: Number(md.maxScore || md.max_score) || 0,
    generalDescription: md.generalDescription || md.general_description || "",
    scoreDescription0: getDesc('scoreDescription0', 'score_description_0'),
    scoreDescription1: getDesc('scoreDescription1', 'score_description_1'),
    scoreDescription2: getDesc('scoreDescription2', 'score_description_2'),
    scoreDescription3: getDesc('scoreDescription3', 'score_description_3'),
    scoreDescription4: getDesc('scoreDescription4', 'score_description_4'),
  });
}, [maturityDetail, realId]);

  // Sync ke localStorage (auto-save)
  useEffect(() => {
    if (realId && formData.name) {
      const safeData = { ...formData, id: realId };
      localStorage.setItem(`maturityTempForm_${realId}`, JSON.stringify(safeData));
    }
  }, [formData, realId]);

  // Bersihkan localStorage saat unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem(`maturityTempForm_${realId}`);
    };
  }, [realId]);

  // Handle perubahan input
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "levelNumber" || name === "minScore" || name === "maxScore"
          ? Number(value)
          : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await updateMaturity(realId, { ...formData, id: realId });

      localStorage.removeItem(`maturityTempForm_${realId}`);
      router.push(`/maturity-level?success=true&refresh=${Date.now()}`);
      router.refresh();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Navigasi ke halaman deskripsi per variabel
  const handleEditDeskripsi = () => {
    localStorage.setItem(
      `maturityTempForm_${realId}`,
      JSON.stringify({ ...formData, id: realId })
    );
    router.push(`/maturity-level/deskripsi-per-variabel?mode=edit&id=${realId}`);
  };

  // Hitung deskripsi yang sudah diisi
  const filledDescriptions = [
    formData.scoreDescription0,
    formData.scoreDescription1,
    formData.scoreDescription2,
    formData.scoreDescription3,
    formData.scoreDescription4,
  ].filter((desc) => typeof desc === "string" && desc.trim() !== "").length;

  // Loading state
  if (isLoadingDetail || !maturityDetail) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl text-center">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  // Render UI
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl"
      >
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="number"
              name="levelNumber"
              value={formData.levelNumber || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Level</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skor Minimum</label>
            <input
              type="number"
              name="minScore"
              value={formData.minScore || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="number"
              name="maxScore"
              value={formData.maxScore || ""}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi Umum
            </label>
            <textarea
              name="generalDescription"
              value={formData.generalDescription}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi per Variabel
            </label>
            <button
              type="button"
              onClick={handleEditDeskripsi}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {filledDescriptions > 0
                ? `Lihat Deskripsi (${filledDescriptions}/5)`
                : "+ Tambah Deskripsi"}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={() => router.push("/maturity-level")}
            variant="ghost"
            icon={X}
            iconColor="text-red-600"
            iconPosition="left"
            className="rounded-[12px] px-4 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            type="submit"
            disabled={isUpdating}
            icon={Save}
            iconPosition="left"
            className="rounded-[12px] px-4 py-2 text-sm font-semibold"
          >
            {isUpdating ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}