"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import { useGetMaturityLevelById, useUpdateMaturityLevel } from "@/hooks/useMaturityLevel";
import { MaturityLevel } from "@/interfaces/maturity-level";
import Container from "@/components/Container";

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

  // Hooks API
  const { data: maturityDetail, loading: isLoadingDetail } =
    useGetMaturityLevelById(realId);
  const { mutate: updateMaturity, loading: isUpdating } =
    useUpdateMaturityLevel();

  // State form
  const [formData, setFormData] = useState<MaturityLevel>({
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
    created_at: "",
    updated_at: "",
  });

  // Load data dari localStorage → fallback ke API
  useEffect(() => {
    const tempKey = `maturityTempForm_${realId}`;
    const temp = localStorage.getItem(tempKey);

    if (temp) {
      try {
        const parsed = JSON.parse(temp);
        if (parsed.id === realId) {
          console.log("Restoring from localStorage:", parsed);
          setFormData(parsed);
          return;
        }
      } catch (err) {
        console.error("Error parsing localStorage:", err);
      }
    }

    if (maturityDetail) {
      setFormData({
        ...maturityDetail,
        scoreDescription0: maturityDetail.scoreDescription0 || "",
        scoreDescription1: maturityDetail.scoreDescription1 || "",
        scoreDescription2: maturityDetail.scoreDescription2 || "",
        scoreDescription3: maturityDetail.scoreDescription3 || "",
        scoreDescription4: maturityDetail.scoreDescription4 || "",
        generalDescription: maturityDetail.generalDescription || "",
      });
    }
  }, [maturityDetail, realId]);

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
      const { id, created_at, updated_at, ...payload } = formData;

      // Sanitize payload supaya aman
      const safePayload = {
        ...payload,
        name: payload.name?.trim() || "",
        levelNumber: Number(payload.levelNumber) || 0,
        minScore: Number(payload.minScore) || 0,
        maxScore: Number(payload.maxScore) || 0,
        generalDescription: payload.generalDescription?.trim() || "",
        scoreDescription0: payload.scoreDescription0?.trim() || "",
        scoreDescription1: payload.scoreDescription1?.trim() || "",
        scoreDescription2: payload.scoreDescription2?.trim() || "",
        scoreDescription3: payload.scoreDescription3?.trim() || "",
        scoreDescription4: payload.scoreDescription4?.trim() || "",
      };

      console.log("Payload update:", safePayload);
      await updateMaturity(realId, safePayload);

      localStorage.removeItem(`maturityTempForm_${realId}`);

      router.push(`/maturity-level?success=true&refresh=${Date.now()}`);
      router.refresh();
    } catch (error: any) {
      console.error("Update failed:", error);
      const message = encodeURIComponent(
        error.message || "Gagal menyimpan data"
      );
      router.push(`/maturity-level?error=true&message=${message}`);
    }
  };

  // Hitung deskripsi yang sudah diisi
  const filledDescriptions = [
    formData.scoreDescription0,
    formData.scoreDescription1,
    formData.scoreDescription2,
    formData.scoreDescription3,
    formData.scoreDescription4,
  ].filter((desc) => typeof desc === "string" && desc.trim() !== "").length;

  // Navigasi ke halaman deskripsi per variabel
  const handleEditDeskripsi = () => {
    localStorage.setItem(
      `maturityTempForm_${realId}`,
      JSON.stringify({ ...formData, id: realId })
    );
    router.push(`/maturity-level/deskripsi-per-variabel?mode=edit&id=${realId}`);
  };

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
    <div >
        <form
        onSubmit={handleSubmit}
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
            <label className="block text-sm font-medium mb-1">Deskripsi Umum</label>
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
