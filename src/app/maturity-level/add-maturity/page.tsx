"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";

export default function AddMaturityLevelPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: [] as string[],
  });

  const [showNotif, setShowNotif] = useState(false); // state untuk notifikasi
  const router = useRouter();

  useEffect(() => {
    const savedForm = localStorage.getItem("maturityTempForm");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
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

  const isFormValid =
    formData.level.trim() !== "" &&
    formData.namaLevel.trim() !== "" &&
    formData.skorMin.trim() !== "" &&
    formData.skorMax.trim() !== "" &&
    formData.deskripsiUmum.trim() !== "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/maturity-level?success=true");


    const existingData =
      JSON.parse(localStorage.getItem("maturityData") || "[]");

    const updatedData = [...existingData, formData];
    localStorage.setItem("maturityData", JSON.stringify(updatedData));

    localStorage.removeItem("maturityTempForm");

    setFormData({
      level: "",
      namaLevel: "",
      skorMin: "",
      skorMax: "",
      deskripsiUmum: "",
      deskripsiPerVariabel: [],
    });

    // ✅ Tampilkan notifikasi sukses
    setShowNotif(true);
    setTimeout(() => {
      setShowNotif(false);
      router.push("/maturity-level"); // pindah ke tabel setelah notif hilang
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center relative">
      {/* Notifikasi */}
      {showNotif && (
        <div className="absolute bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-between min-w-[280px]">
          <span className="font-medium">Data Berhasil Disimpan</span>
          <button
            onClick={() => setShowNotif(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl"
      >
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium">Level</label>
            <input
              type="text"
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
              type="text"
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
              type="text"
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
                  JSON.stringify(formData)
                );
                router.push("/maturity-level/deskripsi-per-variabel");
              }}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {formData.deskripsiPerVariabel &&
              formData.deskripsiPerVariabel.length > 0
                ? "Lihat Deskripsi"
                : "+ Tambah Deskripsi"}
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button
            onClick={() => router.push("/maturity-level")}
            variant="outline"
            icon={X}
            iconPosition="left"
            className="rounded-[12px] px-17 py-2"
            >
            Batal
          </Button>

          <Button
            variant="primary"
            type="submit"
            icon={Save}
            iconPosition="left"
            className="rounded-[12px] px-17 py-2 text-sm font-semibold"
            disabled={!isFormValid}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
