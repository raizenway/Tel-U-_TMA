"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";

type MaturityType = {
  level: string;
  namaLevel: string;
  skorMin: string;
  skorMax: string;
  deskripsiUmum: string;
  deskripsiPerVariabel: string[];
};

export default function EditMaturityPage() {
  const { id } = useParams(); // id bisa array di App Router
  const router = useRouter();

  // Ambil id sebagai string
  const realId = Array.isArray(id) ? id[0] : id;
  if (!realId) {
    router.push("/maturity-level");
    return null; // Hindari render jika id tidak valid
  }

  const [formData, setFormData] = useState<MaturityType>({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: Array(5).fill(""), // default 5 elemen
  });

  // Key unik untuk localStorage
  const tempKey = `maturityTempForm_${realId}`;

  // Muat data dari localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("maturityData");
    if (savedData) {
      const parsed: MaturityType[] = JSON.parse(savedData);
      const record = parsed[Number(realId)]; // pakai Number(realId) sebagai index
      if (record) {
        setFormData({
          ...record,
          deskripsiPerVariabel: Array.isArray(record.deskripsiPerVariabel)
            ? record.deskripsiPerVariabel
            : Array(5).fill(""),
        });
      }
    }
  }, [realId]);

  // Muat data sementara saat kembali
  useEffect(() => {
    const handleFocus = () => {
      const tempForm = localStorage.getItem(tempKey);
      if (tempForm) {
        try {
          const tempData: MaturityType = JSON.parse(tempForm);
          setFormData((prev) => ({
            ...prev,
            ...tempData,
            deskripsiPerVariabel: Array.isArray(tempData.deskripsiPerVariabel)
              ? tempData.deskripsiPerVariabel
              : prev.deskripsiPerVariabel,
          }));
        } catch (e) {
          console.error("Error parsing temp data:", e);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    handleFocus(); // cek saat mount

    return () => window.removeEventListener("focus", handleFocus);
  }, [tempKey]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const savedData = localStorage.getItem("maturityData");
    if (savedData && !isNaN(Number(realId))) {
      const parsed: MaturityType[] = JSON.parse(savedData);
      parsed[Number(realId)] = formData;
      localStorage.setItem("maturityData", JSON.stringify(parsed));
      localStorage.removeItem(tempKey); // hapus data sementara
    }

    router.push("/maturity-level?success=true");
  };

  const handleEditDeskripsi = () => {
    localStorage.setItem(tempKey, JSON.stringify(formData));
    router.push(`/maturity-level/deskripsi-per-variabel?mode=edit&id=${realId}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl">
        {/* Row 1 */}
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

        {/* Row 2 */}
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

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Umum</label>
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
              onClick={handleEditDeskripsi}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {formData.deskripsiPerVariabel.some((d) => d.trim())
                ? `Lihat & Edit Deskripsi (${formData.deskripsiPerVariabel.filter(Boolean).length}/5)`
                : "+ Tambah Deskripsi"}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={() => router.push("/maturity-level")}
            variant="ghost"
            icon={X}
            iconColor="text-red-600"
            iconPosition="left"
            className="rounded-[12px] px-4 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            type="submit"
            icon={Save}
            iconPosition="left"
            className="rounded-[12px] px-4 py-2 text-sm font-semibold"
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}