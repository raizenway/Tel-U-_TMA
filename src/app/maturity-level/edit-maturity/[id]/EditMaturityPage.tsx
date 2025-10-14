
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import { useGetMaturityLevelById, useUpdateMaturityLevel } from "@/hooks/useMaturityLevel";
import { MaturityLevel } from "@/interfaces/maturity-level";

export default function EditMaturityPage() {
  const { id } = useParams();
  const router = useRouter();
  const realId = Array.isArray(id) ? Number(id[0]) : Number(id);

  useEffect(() => {
    if (!realId || isNaN(realId)) {
      console.warn("Invalid ID, redirecting...");
      router.push("/maturity-level");
    }
  }, [realId, router]);

  if (!realId || isNaN(realId)) return null;

  const { data: maturityDetail, loading: isLoadingDetail } =
    useGetMaturityLevelById(realId);
  const { mutate: updateMaturity, loading: isUpdating } =
    useUpdateMaturityLevel();

  const [formData, setFormData] = useState<MaturityLevel>({
    id: realId,
    name: "",
    levelNumber: 0,
    minScore: "",
    maxScore: "",
    description: "",
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
  // Jangan lanjut jika maturityDetail belum siap
  if (!maturityDetail) {
    return;
  }

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

  // Isi dari API hanya jika maturityDetail valid
  setFormData({
    id: maturityDetail.id,
    name: maturityDetail.name || "",
    levelNumber: maturityDetail.levelNumber ?? 0,
    minScore: String(maturityDetail.minScore ?? ""),
    maxScore: String(maturityDetail.maxScore ?? ""),
    description: maturityDetail.description || "",
    created_at: maturityDetail.created_at || "",
    updated_at: maturityDetail.updated_at || "",
  });
}, [maturityDetail, realId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "levelNumber" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { id, created_at, updated_at, ...payload } = formData;

      const safePayload = {
        ...payload,
        name: payload.name?.trim() || "",
        levelNumber: Number(payload.levelNumber) || 0,
        minScore: payload.minScore?.trim() || "",
        maxScore: payload.maxScore?.trim() || "",
        description: payload.description?.trim() || "",
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


  const handleEditDeskripsi = () => {
    localStorage.setItem(
      `maturityTempForm_${realId}`,
      JSON.stringify({ ...formData, id: realId })
    );
    router.push(`/maturity-level/deskripsi-per-variabel?mode=edit&id=${realId}`);
  };

  if (isLoadingDetail || !maturityDetail) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl text-center">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
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

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skor Minimum</label>
            <input
              type="text"
              name="minScore"
              value={formData.minScore}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="text"
              name="maxScore"
              value={formData.maxScore}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Umum</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 h-[100px]"
            />
          </div>
        </div>

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

