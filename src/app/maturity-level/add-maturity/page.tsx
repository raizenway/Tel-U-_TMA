"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import SuccessNotification from "@/components/SuccessNotification";
import { useCreateMaturityLevel } from "@/hooks/useMaturityLevel";
import { CreateMaturityLevelRequest } from "@/interfaces/maturity-level";

export default function AddMaturityLevelPage() {
  const [formData, setFormData] = useState<CreateMaturityLevelRequest>({
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

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, loading } = useCreateMaturityLevel();
  const router = useRouter();

  // ✅ Load dari localStorage saat halaman pertama kali dibuka
  useEffect(() => {
    const tempForm = localStorage.getItem("maturityTempForm");
    if (!tempForm) return;

    try {
      const parsed = JSON.parse(tempForm);

      // Hanya load jika ini memang dari mode add
      if (parsed.fromAdd === true) {
        setFormData({
          name: parsed.name || "",
          levelNumber: parsed.levelNumber || 0,
          minScore: parsed.minScore || 0,
          maxScore: parsed.maxScore || 0,
          generalDescription: parsed.generalDescription || "",
          scoreDescription0: parsed.scoreDescription0 || "",
          scoreDescription1: parsed.scoreDescription1 || "",
          scoreDescription2: parsed.scoreDescription2 || "",
          scoreDescription3: parsed.scoreDescription3 || "",
          scoreDescription4: parsed.scoreDescription4 || "",
        });
      }
    } catch (e) {
      console.warn("Gagal parse maturityTempForm:", e);
    }
  }, []);

  // ✅ Reload deskripsi saat kembali dari halaman deskripsi
  useEffect(() => {
    const handleFocus = () => {
      const tempForm = localStorage.getItem("maturityTempForm");
      if (!tempForm) return;

      try {
        const tempData = JSON.parse(tempForm);
        setFormData((prev) => ({
          ...prev,
          scoreDescription0: tempData.scoreDescription0 || prev.scoreDescription0,
          scoreDescription1: tempData.scoreDescription1 || prev.scoreDescription1,
          scoreDescription2: tempData.scoreDescription2 || prev.scoreDescription2,
          scoreDescription3: tempData.scoreDescription3 || prev.scoreDescription3,
          scoreDescription4: tempData.scoreDescription4 || prev.scoreDescription4,
        }));
      } catch (e) {
        console.warn("Gagal muat deskripsi dari localStorage:", e);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "levelNumber" || name === "minScore" || name === "maxScore"
          ? Number(value) || 0 // <-- fallback ke 0 jika NaN
          : value,
    }));
  };

  const isFormValid =
  formData.name.trim() !== "" &&
  !isNaN(formData.levelNumber) &&
  formData.levelNumber >= 0 &&
  !isNaN(formData.minScore) &&
  formData.minScore >= 0 &&
  !isNaN(formData.maxScore) &&
  formData.maxScore >= 0 &&
  formData.minScore <= formData.maxScore &&
  formData.generalDescription.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage("Harap lengkapi semua field dengan benar.");
      return;
    }

    try {
      await mutate(formData);

      // ✅ Reset form & localStorage
      localStorage.removeItem("maturityTempForm");
      setFormData({
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
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center relative">
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Data berhasil disimpan"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="number"
              name="levelNumber"
              value={formData.levelNumber || ""}
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
              value={formData.minScore || ""}
              onChange={handleChange}
              placeholder="Masukkan Angka Minimum"
              min="0"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="number"
              name="maxScore"
              value={formData.maxScore || ""}
              onChange={handleChange}
              placeholder="Masukkan Angka Maximum"
              min="0"
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Umum</label>
            <textarea
              name="generalDescription"
              value={formData.generalDescription}
              onChange={handleChange}
              placeholder="Masukkan Deskripsi"
              className="w-full border rounded-md px-3 py-2 h-[90px]"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Deskripsi per Variabel
            </label>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(
                  "maturityTempForm",
                  JSON.stringify({ ...formData, fromAdd: true }) // <-- pastikan flag fromAdd=true
                );
                router.push(`/maturity-level/deskripsi-per-variabel?mode=add`);
              }}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {Object.values(formData)
                .slice(5) // ambil dari scoreDescription0 dst
                .some((d) => d?.trim())
                ? "Lihat Deskripsi"
                : "+ Tambah Deskripsi"}
            </button>
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