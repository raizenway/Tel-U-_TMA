"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddMaturityPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: "",
  });
 
  const router = useRouter(); 

  const [dataTable, setDataTable] = useState<any[]>([]);

  // handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDataTable((prev) => [...prev, formData]);
    setFormData({
      level: "",
      namaLevel: "",
      skorMin: "",
      skorMax: "",
      deskripsiUmum: "",
      deskripsiPerVariabel: "",
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
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
            <label className="block mb-1 text-sm font-medium">Deskripsi per Variabel</label>
            <button
              onClick={() => router.push("/maturity-level/deskripsi-per-variabel")}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              + Tambah Deskripsi
            </button>
          </div>       
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
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
