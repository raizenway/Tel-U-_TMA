"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeskripsiVariabelTable() {
  const router = useRouter();
  const [deskripsi, setDeskripsi] = useState<string[]>(Array(5).fill(""));

  // ambil data sementara kalau sudah pernah diisi
  useEffect(() => {
    const saved = localStorage.getItem("deskripsiPerVariabelTemp");
    if (saved) {
      setDeskripsi(JSON.parse(saved));
    }
  }, []);

  // cek apakah semua field sudah diisi
  const allFilled = deskripsi.every((desc) => desc.trim() !== "");

  const handleSave = () => {
    // simpan ke localStorage sementara
    localStorage.setItem("deskripsiPerVariabelTemp", JSON.stringify(deskripsi));

    // setelah simpan, kembali ke halaman sebelumnya
    router.back();
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-6">
          {deskripsi.map((value, index) => (
            <div
              key={index}
              className={`${index === 4 ? "col-span-2 w-1/2" : ""}`}
            >
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Deskripsi Skor {index}
              </label>
              <textarea
                value={value}
                onChange={(e) => {
                  const newDesc = [...deskripsi];
                  newDesc[index] = e.target.value;
                  setDeskripsi(newDesc);
                }}
                placeholder="Masukkan Deskripsi"
                className="w-full h-28 border rounded-md p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => router.back()}
            className="flex items-center px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <span className="text-red-500 mr-2">✗</span> Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!allFilled}
            className={`flex items-center px-6 py-2 rounded-md ${
              allFilled
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
