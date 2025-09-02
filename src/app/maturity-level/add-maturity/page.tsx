"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { X, Save } from "lucide-react";
import SuccessNotification from "@/components/SuccessNotification";

export default function AddMaturityLevelPage() {
  const [formData, setFormData] = useState({
    level: "",
    namaLevel: "",
    skorMin: "",
    skorMax: "",
    deskripsiUmum: "",
    deskripsiPerVariabel: [] as string[],
  });

  const [showNotif, setShowNotif] = useState(false);
  const router = useRouter();
  const [ ShowSuccess, setShowSuccess ] = useState(false);


  // ✅ Muat data sementara hanya jika dari halaman tambah
  useEffect(() => {
    const tempForm = localStorage.getItem("maturityTempForm");

    if (tempForm) {
      try {
        const parsed = JSON.parse(tempForm);
        if (parsed.fromAdd === true) {
          setFormData((prev) => ({
            ...prev,
            level: parsed.level || "",
            namaLevel: parsed.namaLevel || "",
            skorMin: parsed.skorMin || "",
            skorMax: parsed.skorMax || "",
            deskripsiUmum: parsed.deskripsiUmum || "",
            deskripsiPerVariabel: Array.isArray(parsed.deskripsiPerVariabel)
              ? parsed.deskripsiPerVariabel
              : [],
          }));
        }
      } catch (e) {
        console.warn("Gagal parse maturityTempForm", e);
      }
    }
  }, []);

  // ✅ Dengarkan update dari halaman deskripsi-per-variabel
  useEffect(() => {
    const handleFocus = () => {
      const tempForm = localStorage.getItem("maturityTempForm");
      if (tempForm) {
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
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!isFormValid) return;

    // ✅ Pastikan key lama tidak ganggu
    localStorage.removeItem("maturityLevels");

    // ✅ Ambil data lama dari localStorage
    const existingDataStr = localStorage.getItem("maturityData");
    let existingData: any[] = [];

    try {
      if (existingDataStr) {
        existingData = JSON.parse(existingDataStr);
      }
    } catch (e) {
      console.error("Data maturityData rusak, reset ke array kosong");
      existingData = [];
    }

    // ✅ Cek duplikat level (anggap angka & string sama)
    const newLevel = formData.level.trim();
    const isDuplicate = existingData.some(
      (item) => String(item.level).trim() === newLevel
    );

    if (isDuplicate) {
      alert(`Level ${newLevel} sudah ada. Harap gunakan level yang berbeda.`);
      return;
    }

    // ✅ Buat data baru
    const newData = {
      level: newLevel,
      namaLevel: formData.namaLevel.trim(),
      skorMin: formData.skorMin.trim(),
      skorMax: formData.skorMax.trim(),
      deskripsiUmum: formData.deskripsiUmum.trim(),
      deskripsiPerVariabel: [...formData.deskripsiPerVariabel],
    };

    // ✅ Simpan ke localStorage
    const updatedData = [...existingData, newData];
    localStorage.setItem("maturityData", JSON.stringify(updatedData));

    // ✅ Hapus data sementara
    localStorage.removeItem("maturityTempForm");

    // ✅ Reset form
    setFormData({
      level: "",
      namaLevel: "",
      skorMin: "",
      skorMax: "",
      deskripsiUmum: "",
      deskripsiPerVariabel: [],
    });

    // ✅ Tampilkan notifikasi
    setShowNotif(true);
    setTimeout(() => {
      setShowNotif(false);
      router.push("/maturity-level");
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center relative">
     {/* Notifikasi */}
        <SuccessNotification
           isOpen={ShowSuccess}
           onClose={() => setShowSuccess(false)}
           message="Data berhasil disimpan"
        />


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
                  JSON.stringify({
                    ...formData,
                    fromAdd: true,
                  })
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
            disabled={!isFormValid}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
