"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save } from "lucide-react";
import Button from "@/components/button";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";

export default function DeskripsiVariabelTable() {
  const router = useRouter();
  const [deskripsi, setDeskripsi] = useState<string[]>(Array(5).fill(""));
  const [showCancel, setShowCancel] = useState(false);

  // ambil data sementara kalau sudah pernah diisi
  useEffect(() => {
    const saved = localStorage.getItem("deskripsiPerVariabelTemp");
    if (saved) {
      setDeskripsi(JSON.parse(saved));
    } else {
      const savedForm = localStorage.getItem("maturityTempForm");
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        if (Array.isArray(parsed.deskripsiPerVariabel)) {
          setDeskripsi(parsed.deskripsiPerVariabel);
        }
      }
    }
  }, []);

  // cek apakah semua field sudah diisi
  const allFilled = deskripsi.every((desc) => desc.trim() !== "");

  const handleSave = () => {
    localStorage.setItem("deskripsiPerVariabelTemp", JSON.stringify(deskripsi));
    const savedForm = JSON.parse(localStorage.getItem("maturityTempForm") || "{}");
    savedForm.deskripsiPerVariabel = deskripsi;
    localStorage.setItem("maturityTempForm", JSON.stringify(savedForm));
    router.back();
  };

  const handleCancel = () => {
    router.push("/maturity-level");
    setShowCancel(false);
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
          <Button
            variant="outline"
            icon={X}
            iconPosition="left"
            className="rounded-[12px] px-17 py-2"
            onClick={() => setShowCancel(true)}
          >
            Batal
          </Button>

          <Button
            variant="simpan"
            icon={Save}
            iconPosition="left"
            disabled={!allFilled}
            className={`rounded-[12px] px-17 py-2 text-sm font-semibold ${
              allFilled ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
          >
            Simpan
          </Button>
        </div>
      </div>

      {/* Modal konfirmasi Batal */}
      <ModalConfirm
        isOpen={showCancel}
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
        title="Apakah kamu yakin ingin membatalkan perubahan?"
        header="Konfirmasi"
        confirmLabel="Ya, Batalkan"
        cancelLabel="Kembali"
      >
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-left text-sm">
          <div className="font-bold mb-1">⚠ Peringatan</div>
          <div>Perubahan yang belum disimpan akan hilang jika kamu keluar.</div>
        </div>
      </ModalConfirm>
    </div>
  );
}
