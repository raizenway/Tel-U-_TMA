"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import SuccessNotification from "@/components/SuccessNotification";
import { useCreateMaturityLevel } from "@/hooks/useMaturityLevel";
import { CreateMaturityLevelRequest } from "@/interfaces/maturity-level";

type CreateMaturityLevelState = Omit<
  CreateMaturityLevelRequest,
  "levelNumber" | "minScore" | "maxScore"
> & {
  levelNumber: string;
  minScore: string;
  maxScore: string;
};

export default function AddMaturityLevelPage() {
  const [formData, setFormData] = useState<CreateMaturityLevelState>({
    name: "",
    levelNumber: "",
    minScore: "",
    maxScore: "",
    description: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, loading } = useCreateMaturityLevel();
  const router = useRouter();

  useEffect(() => {
    const tempForm = localStorage.getItem("maturityTempForm");
    if (!tempForm) return;

    try {
      const parsed = JSON.parse(tempForm);

      if (parsed.fromAdd === true) {
        setFormData({
          name: parsed.name || "",
          levelNumber: String(parsed.levelNumber ?? ""),
          minScore: String(parsed.minScore ?? ""),
          maxScore: String(parsed.maxScore ?? ""),
          description: parsed.description || "",
        });
      }
    } catch (e) {
      console.warn("Gagal parse maturityTempForm:", e);
    }
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parsedLevel = Number(formData.levelNumber);
  const parsedMin = Number(formData.minScore);
  const parsedMax = Number(formData.maxScore);

  const isFormValid =
    formData.name.trim() !== "" &&
    !isNaN(parsedLevel) &&
    parsedLevel >= 0 &&
    !isNaN(parsedMin) &&
    parsedMin >= 0 &&
    !isNaN(parsedMax) &&
    parsedMax >= 0 &&
    parsedMin <= parsedMax &&
    formData.description.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage("Harap lengkapi semua field dengan benar.");
      return;
    }

    try {
      const payload: CreateMaturityLevelRequest = {
        name: formData.name.trim(),
        levelNumber: parsedLevel,
        minScore: String(parsedMin),
        maxScore: String(parsedMax),
        description: formData.description.trim(),
      };

      await mutate(payload);

      localStorage.removeItem("maturityTempForm");
      setFormData({
        name: "",
        levelNumber: "",
        minScore: "",
        maxScore: "",
        description: "",
      });

      setErrorMessage(null);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/maturity-level");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Data berhasil disimpan"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="number"
              name="levelNumber"
              value={formData.levelNumber}
              onChange={handleChange}
              placeholder="Masukkan Angka Level"
              min="0"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Level</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan Nama Level"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Minimum</label>
            <input
              type="number"
              name="minScore"
              value={formData.minScore}
              onChange={handleChange}
              placeholder="Masukan Angka Minimum"
              min="0"
              step="0.1"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="number"
              name="maxScore"
              value={formData.maxScore}
              onChange={handleChange}
              placeholder="Masukan Angka Maximum"
              min="0"
              step="0.1"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Umum</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Masukkan Deskripsi"
              className="w-full border rounded-md px-3 py-2 h-[90px]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            onClick={() => {
              localStorage.removeItem("maturityTempForm");
              router.push("/maturity-level");
            }}
            variant="ghost"
            icon={X}
            iconColor="text-red-600"
            iconPosition="left"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 border border-gray-300"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            type="submit"
            icon={Save}
            iconPosition="left"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            disabled={!isFormValid || loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-sm mt-3">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}  