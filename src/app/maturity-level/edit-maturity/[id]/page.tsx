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
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<MaturityType>({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: [],
  });

  // Fungsi untuk ambil data dari localStorage
  const loadData = () => {
    const savedData = localStorage.getItem("maturityData");
    if (savedData && id !== undefined) {
      const parsed: MaturityType[] = JSON.parse(savedData);
      const record = parsed[Number(id)];
      if (record) {
        setFormData(record);
      }
    }
  };

  // Ambil data awal dari maturityData
  useEffect(() => {
    loadData();
  }, [id]);

  // Cek apakah data sementara diperbarui saat kembali dari halaman edit deskripsi
  useEffect(() => {
    const handleStorageChange = () => {
      const tempForm = localStorage.getItem("maturityTempForm");
      if (tempForm) {
        const tempData: MaturityType = JSON.parse(tempForm);
        // Update hanya deskripsiPerVariabel jika ada perubahan
        setFormData((prev) => ({
          ...prev,
          deskripsiPerVariabel: tempData.deskripsiPerVariabel,
        }));
      }
    };

    // Cek setiap kali komponen muncul (misalnya setelah kembali dari navigasi)
    window.addEventListener("focus", handleStorageChange);

    // Juga cek saat komponen mount (untuk kasus kembali dari halaman lain)
    handleStorageChange();

    return () => {
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

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

    const savedData = localStorage.getItem("maturityData");
    if (savedData && id !== undefined) {
      const parsed: MaturityType[] = JSON.parse(savedData);
      parsed[Number(id)] = formData;
      localStorage.setItem("maturityData", JSON.stringify(parsed));
    }

    router.push("/maturity-level");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-5xl"
      >
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
              onClick={() => {
                // Simpan sementara sebelum pergi
                localStorage.setItem("maturityTempForm", JSON.stringify(formData));
                router.push(`/maturity-level/deskripsi-per-variabel`);
              }}
              className="w-full border rounded-lg p-2 font-medium text-blue-700 border-blue-700 hover:bg-blue-50"
            >
              {formData.deskripsiPerVariabel && formData.deskripsiPerVariabel.length > 0
                ? `Lihat Deskripsi (${formData.deskripsiPerVariabel.length})`
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
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}