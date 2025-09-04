"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import SuccessNotification from "@/components/SuccessNotification";
import { useCreateMaturityLevel } from "@/hooks/useMaturityLevel";

export default function AddMaturityLevelPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate, loading, error } = useCreateMaturityLevel();
  const router = useRouter();

  // Muat data sementara (kalau ada)
  useEffect(() => {
    const tempForm = localStorage.getItem("maturityTempForm");
    if (!tempForm) return;
    try {
      const parsed = JSON.parse(tempForm);
      if (parsed.fromAdd === true) {
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          deskripsiPerVariabel: Array.isArray(parsed.deskripsiPerVariabel)
            ? parsed.deskripsiPerVariabel
            : [],
        }));
      }
    } catch (e) {
      console.warn("Gagal parse maturityTempForm", e);
    }
  }, []);

  // Sync dari halaman deskripsi-per-variabel
  useEffect(() => {
    const handleFocus = () => {
      const tempForm = localStorage.getItem("maturityTempForm");
      if (!tempForm) return;
      try {
        const tempData = JSON.parse(tempForm);
        if (Array.isArray(tempData.deskripsiPerVariabel)) {
          setFormData((prev) => ({
            ...prev,
            deskripsiPerVariabel: tempData.deskripsiPerVariabel,
          }));
        }
      } catch (e) {
        console.warn("Gagal muat deskripsiPerVariabel", e);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    formData.level.trim() !== "" &&
    formData.namaLevel.trim() !== "" &&
    formData.skorMin.trim() !== "" &&
    formData.skorMax.trim() !== "" &&
    formData.deskripsiUmum.trim() !== "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      // Kirim sesuai interface API (EN)
      await mutate({
        name: formData.namaLevel.trim(),
        levelNumber: Number(formData.level),
        minScore: Number(formData.skorMin),
        maxScore: Number(formData.skorMax),
        generalDescription: formData.deskripsiUmum.trim(),
        scoreDescription: formData.deskripsiPerVariabel,
      });

      // Beresin state & storage
      localStorage.removeItem("maturityTempForm");
      setFormData({
        level: "",
        namaLevel: "",
        skorMin: "",
        skorMax: "",
        deskripsiUmum: "",
        deskripsiPerVariabel: [],
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/maturity-level");
      }, 2000);
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err?.message ?? "Unknown error"));
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
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium">Level</label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="Masukkan Angka Level"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nama Level</label>
            <input
              type="text"
              name="namaLevel"
              value={formData.namaLevel}
              onChange={handleChange}
              placeholder="Masukkan Nama Level"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Skor Minimum</label>
            <input
              type="number"
              name="skorMin"
              value={formData.skorMin}
              onChange={handleChange}
              placeholder="Masukkan Angka Minimum"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Skor Maximum</label>
            <input
              type="number"
              name="skorMax"
              value={formData.skorMax}
              onChange={handleChange}
              placeholder="Masukkan Angka Maximum"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi Umum</label>
            <textarea
              name="deskripsiUmum"
              value={formData.deskripsiUmum}
              onChange={handleChange}
              placeholder="Masukkan Deskripsi"
              className="w-full border rounded-md px-3 py-2 h-[90px]"
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
                  JSON.stringify({ ...formData, fromAdd: true })
                );
                router.push(`/maturity-level/deskripsi-per-variabel?mode=add`);
              }}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {formData.deskripsiPerVariabel.length > 0
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
            className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
          >
            Batal
          </Button>

        <Button
            variant="primary"
            type="submit"
            icon={Save}
            iconPosition="left"
            className="rounded-[12px] px-17 py-2 text-sm font-semibold"
            disabled={!isFormValid || loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}
