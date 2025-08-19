"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function MaturityLevelPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: "",
  });

  const router = useRouter();

  // Ambil data form sementara dari localStorage saat halaman pertama kali dibuka
  useEffect(() => {
    const savedForm = localStorage.getItem("maturityTempForm");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
  }, []);

  // handle input change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Ambil data lama dari localStorage
    const existingData =
      JSON.parse(localStorage.getItem("maturityData") || "[]");

    // Tambahkan data baru
    const updatedData = [...existingData, formData];

    // Simpan lagi ke localStorage
    localStorage.setItem("maturityData", JSON.stringify(updatedData));

    // Hapus data form sementara
    localStorage.removeItem("maturityTempForm");

    // Reset form
    setFormData({
      level: "",
      namaLevel: "",
      skorMin: "",
      skorMax: "",
      deskripsiUmum: "",
      deskripsiPerVariabel: "",
    });

    // Pindah ke halaman tabel
    router.push("/maturity-level");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
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
                // Simpan form sementara sebelum pindah ke halaman deskripsi
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
          <button
            type="button"
            onClick={() => router.push("/maturity-level")}
            className="px-4 py-2 border border-red-500 text-red-500 rounded-md"
          >
            ✕ Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
