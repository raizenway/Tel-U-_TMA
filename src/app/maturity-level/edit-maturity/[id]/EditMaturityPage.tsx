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

  useEffect(() => {
    if (!realId) router.push("/maturity-level");
  }, [realId, router]);

  if (!realId) return null;

  const { data: maturityDetail } = useGetMaturityLevelById(realId);
  const { mutate: updateMaturity, loading } = useUpdateMaturityLevel();

  const [formData, setFormData] = useState<UpdateMaturityLevelRequest>({
    id: realId,
    name: "",
    levelNumber: 0,
    minScore: 0,
    maxScore: 0,
    generalDescription: "",
    scoreDescription: Array(5).fill(""),
  });

  // ✅ Ambil data API atau localStorage (jika ada temp)
  useEffect(() => {
    if (!maturityDetail) return;

    const temp = localStorage.getItem(`maturityTempForm_${realId}`);
    if (temp) {
      try {
        const parsed = JSON.parse(temp);
        if (Array.isArray(parsed.scoreDescription)) {
          setFormData({ ...parsed, id: realId });
          return;
        }
      } catch (err) {
        console.error("Error parsing temp form:", err);
      }
    }

    // fallback → pakai data dari API
    const apiData = maturityDetail as any;
    setFormData({
      id: maturityDetail.id,
      name: maturityDetail.name,
      levelNumber: maturityDetail.levelNumber,
      minScore: Number(maturityDetail.minScore),
      maxScore: Number(maturityDetail.maxScore),
      generalDescription: maturityDetail.generalDescription,
      scoreDescription: [
        apiData.scoreDescription0 ?? "",
        apiData.scoreDescription1 ?? "",
        apiData.scoreDescription2 ?? "",
        apiData.scoreDescription3 ?? "",
        apiData.scoreDescription4 ?? "",
      ],
    });
  }, [maturityDetail, realId]);

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

  // ✅ Submit → flatten array ke bentuk API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let finalForm = formData;

      // 🔎 ambil data terbaru dari localStorage jika ada
      const temp = localStorage.getItem(`maturityTempForm_${realId}`);
      if (temp) {
        try {
          const parsed = JSON.parse(temp);
          if (Array.isArray(parsed.scoreDescription)) {
            finalForm = { ...formData, scoreDescription: parsed.scoreDescription };
          }
        } catch (err) {
          console.error("Error parsing temp form:", err);
        }
      }

      const { scoreDescription, ...rest } = finalForm;

      // 🔑 Flatten array scoreDescription → scoreDescription0..4
      const payload: any = {
        ...rest,
        scoreDescription0: scoreDescription[0] ?? "",
        scoreDescription1: scoreDescription[1] ?? "",
        scoreDescription2: scoreDescription[2] ?? "",
        scoreDescription3: scoreDescription[3] ?? "",
        scoreDescription4: scoreDescription[4] ?? "",
      };

      await updateMaturity(payload); // kirim payload ke API

      localStorage.removeItem(`maturityTempForm_${realId}`);
      router.push(`/maturity-level?success=true&refresh=${Date.now()}`);
      router.refresh();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleEditDeskripsi = () => {
    localStorage.setItem(
      `maturityTempForm_${realId}`,
      JSON.stringify(formData)
    );
    router.push(`/maturity-level/deskripsi-per-variabel?mode=edit&id=${realId}`);
  };

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
              value={formData.levelNumber}
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
              value={formData.minScore}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="number"
              name="maxScore"
              value={formData.maxScore}
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
              {formData.scoreDescription?.some((d) => d.trim())
                ? `Lihat Deskripsi (${formData.scoreDescription.filter(Boolean).length}/5)`
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
            disabled={loading}
            icon={Save}
            iconPosition="left"
            className="rounded-[12px] px-4 py-2 text-sm font-semibold"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
