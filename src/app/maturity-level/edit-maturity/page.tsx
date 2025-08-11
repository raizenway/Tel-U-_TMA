"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function EditMaturityPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: "",
  });

  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Data tersimpan:", formData);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl"
      >
        {/* Row 1: Level & Nama Level */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Level</label>
            <input
              type="text"
              name="namaLevel"
              value={formData.namaLevel}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Row 2: Skor Minimum & Skor Maximum */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skor Minimum</label>
            <input
              type="text"
              name="skorMin"
              value={formData.skorMin}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skor Maximum</label>
            <input
              type="text"
              name="skorMax"
              value={formData.skorMax}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Row 3: Deskripsi Umum & Deskripsi Per Variabel */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi Umum
            </label>
            <textarea
              name="deskripsiUmum"
              value={formData.deskripsiUmum}
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
              onClick={() =>
                router.push("/maturity-level/deskripsi-per-variabel")
              }
              className="w-full border border-blue-500 rounded-md px-4 py-3 text-blue-700 font-medium hover:bg-blue-50"
            >
              Lihat Deskripsi
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-5 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
          >
            ✕ Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
