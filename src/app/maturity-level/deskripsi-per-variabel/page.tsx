"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Save } from "lucide-react";
import Button from "@/components/button";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";

export default function DeskripsiVariabelTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "add"; // "add" | "edit"
  const id = searchParams.get("id"); // ambil id dari query

  const [deskripsi, setDeskripsi] = useState<string[]>(Array(5).fill(""));
  const [showCancel, setShowCancel] = useState(false);

  // key sementara untuk sync dengan EditMaturityPage
  const tempKey = id ? `maturityTempForm_${id}` : "maturityTempForm";

  // ✅ Load data sesuai mode
  useEffect(() => {
    if (id) {
      // 1️⃣ Coba ambil dari tempKey (sementara)
      const savedForm = localStorage.getItem(tempKey);
      if (savedForm) {
        try {
          const parsed = JSON.parse(savedForm);
          if (Array.isArray(parsed.scoreDescription)) {
  const filled = Array(5).fill("").map((_, i) => parsed.scoreDescription[i] || "");
  setDeskripsi(filled);
  return;
}
        } catch (e) {
          console.error("Error parsing temp data:", e);
        }
      }

      // 2️⃣ Fallback: ambil dari maturityData (data utama)
      const savedData = JSON.parse(localStorage.getItem("maturityData") || "[]");
      const item = savedData.find((d: any) => String(d.id) === String(id));
if (item && Array.isArray(item.scoreDescription)) {
  const filled = Array(5).fill("").map((_, i) => item.scoreDescription[i] || "");
  setDeskripsi(filled);
}
    }
  }, [id, tempKey]);

  // cek apakah semua field sudah diisi
  const allFilled = deskripsi.every((desc) => desc.trim() !== "");

  // ✅ Simpan perubahan
  const handleSave = () => {
    if (id) {
      // update selalu ke tempKey
      const savedForm = JSON.parse(localStorage.getItem(tempKey) || "{}");
      savedForm.scoreDescription = deskripsi;
      localStorage.setItem(tempKey, JSON.stringify(savedForm));

      // balik ke edit
      router.push(`/maturity-level/edit-maturity/${id}`);
    } else {
      // add mode
      const savedForm = JSON.parse(localStorage.getItem("maturityTempForm") || "{}");
      savedForm.deskripsiPerVariabel = deskripsi;
      localStorage.setItem("maturityTempForm", JSON.stringify(savedForm));
      router.push("/maturity-level/add-maturity");
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-6">
          {deskripsi.map((value, index) => (
            <div key={index} className={`${index === 4 ? "col-span-2 w-1/2" : ""}`}>
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
            variant="ghost"
            icon={X}
            iconColor="text-red-600"
            iconPosition="left"
            className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
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
        onConfirm={() => {
          if (mode === "edit" && id) {
            router.push(`/maturity-level/edit-maturity/${id}`);
          } else {
            router.push("/maturity-level/add-maturity");
          }
        }}
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
