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
  const id = searchParams.get("id"); // bisa null jika mode=add

  const [deskripsi, setDeskripsi] = useState<Record<string, string>>({
    scoreDescription0: "",
    scoreDescription1: "",
    scoreDescription2: "",
    scoreDescription3: "",
    scoreDescription4: "",
  });

  const [loading, setLoading] = useState(true); // ✅ Tambahkan loading state
  const [showCancel, setShowCancel] = useState(false);

  // ✅ Key localStorage dinamis berdasarkan mode
  const tempKey = id ? `maturityTempForm_${id}` : "maturityTempForm";

  // ✅ Load data saat mount — tunggu sampai data tersedia
  useEffect(() => {
    const loadData = () => {
      const savedForm = localStorage.getItem(tempKey);
      if (savedForm) {
        try {
          const parsed = JSON.parse(savedForm);
          setDeskripsi({
            scoreDescription0: parsed.scoreDescription0 || "",
            scoreDescription1: parsed.scoreDescription1 || "",
            scoreDescription2: parsed.scoreDescription2 || "",
            scoreDescription3: parsed.scoreDescription3 || "",
            scoreDescription4: parsed.scoreDescription4 || "",
          });
          setLoading(false); // ✅ Data tersedia
          return;
        } catch (e) {
          console.error("Error parsing temp data:", e);
        }
      }

      // ✅ Fallback hanya untuk mode edit (karena add tidak punya data sebelumnya)
      if (mode === "edit" && id) {
        try {
          const savedData = JSON.parse(localStorage.getItem("maturityData") || "[]");
          const item = savedData.find((d: any) => String(d.id) === String(id));
          if (item) {
            setDeskripsi({
              scoreDescription0: item.scoreDescription0 || "",
              scoreDescription1: item.scoreDescription1 || "",
              scoreDescription2: item.scoreDescription2 || "",
              scoreDescription3: item.scoreDescription3 || "",
              scoreDescription4: item.scoreDescription4 || "",
            });
          }
        } catch (e) {
          console.error("Error loading fallback data:", e);
        }
      }

      setLoading(false); // ✅ Selesai load, tampilkan form
    };

    // ✅ Tunda sedikit untuk memastikan localStorage sudah di-set
    const timer = setTimeout(loadData, 100);

    return () => clearTimeout(timer);
  }, [id, mode, tempKey]);

  // ✅ Cek apakah SEMUA field sudah diisi
  const allFilled = Object.values(deskripsi).every((desc) => desc.trim() !== "");

  // ✅ Simpan perubahan — handle add & edit
  const handleSave = () => {
    try {
      // Ambil form utama (bisa dari add/edit)
      const savedForm = JSON.parse(localStorage.getItem(tempKey) || "{}");

      // Gabungkan dengan deskripsi baru
      const updatedForm = {
        ...savedForm,
        ...deskripsi,
      };

      // Simpan kembali ke localStorage
      localStorage.setItem(tempKey, JSON.stringify(updatedForm));

      // Trigger event agar halaman edit/add bisa deteksi perubahan
      window.dispatchEvent(new Event("storage"));

      // Redirect sesuai mode
      if (mode === "edit" && id) {
        router.push(`/maturity-level/edit-maturity/${id}`);
      } else {
        router.push("/maturity-level/add-maturity");
      }
    } catch (error) {
      console.error("Error saving deskripsi:", error);
      alert("Gagal menyimpan deskripsi. Coba lagi.");
    }
  };

  // ✅ Tampilkan loading jika data belum siap
  if (loading) {
    return (
      <div className="bg-[#F5F7FA] min-h-screen flex justify-center items-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-5xl text-center">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex justify-center items-center p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-5xl">

        {/* Grid layout: 2 kolom, semua textarea ukuran sama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skor 0 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Skor 0
            </label>
            <textarea
              value={deskripsi.scoreDescription0}
              onChange={(e) =>
                setDeskripsi((prev) => ({
                  ...prev,
                  scoreDescription0: e.target.value,
                }))
              }
              placeholder="Masukkan deskripsi..."
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Skor 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Skor 1
            </label>
            <textarea
              value={deskripsi.scoreDescription1}
              onChange={(e) =>
                setDeskripsi((prev) => ({
                  ...prev,
                  scoreDescription1: e.target.value,
                }))
              }
              placeholder="Masukkan deskripsi..."
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Skor 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Skor 2
            </label>
            <textarea
              value={deskripsi.scoreDescription2}
              onChange={(e) =>
                setDeskripsi((prev) => ({
                  ...prev,
                  scoreDescription2: e.target.value,
                }))
              }
              placeholder="Masukkan deskripsi..."
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Skor 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Skor 3
            </label>
            <textarea
              value={deskripsi.scoreDescription3}
              onChange={(e) =>
                setDeskripsi((prev) => ({
                  ...prev,
                  scoreDescription3: e.target.value,
                }))
              }
              placeholder="Masukkan deskripsi..."
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Skor 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Skor 4
            </label>
            <textarea
              value={deskripsi.scoreDescription4}
              onChange={(e) =>
                setDeskripsi((prev) => ({
                  ...prev,
                  scoreDescription4: e.target.value,
                }))
              }
              placeholder="Masukkan deskripsi..."
              className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="ghost"
            icon={X}
            iconColor="text-red-600"
            iconPosition="left"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 border border-gray-300"
            onClick={() => setShowCancel(true)}
          >
            Batal
          </Button>

          <Button
            variant="simpan"
            icon={Save}
            iconPosition="left"
            disabled={!allFilled}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              allFilled ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
          >
            Simpan
          </Button>
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
    </div>
  );
}