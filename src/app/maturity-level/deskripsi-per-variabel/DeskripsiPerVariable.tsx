"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Save } from "lucide-react";
import Button from "@/components/button";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import { useUpdateMaturityLevel, useCreateMaturityLevel } from "@/hooks/useMaturityLevel";
import { UpdateMaturityLevelRequest, CreateMaturityLevelRequest } from "@/interfaces/maturity-level";

export default function DeskripsiVariabelTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "add"; 
  const id = searchParams.get("id");

  const [deskripsi, setDeskripsi] = useState<Record<string, string>>({
    scoreDescription0: "",
    scoreDescription1: "",
    scoreDescription2: "",
    scoreDescription3: "",
    scoreDescription4: "",
  });

  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);

  const { mutate: updateMaturity, loading: isUpdating } = useUpdateMaturityLevel();
  const { mutate: createMaturity, loading: isCreating } = useCreateMaturityLevel();

  const isLoading = isUpdating || isCreating;

  useEffect(() => {
    const loadData = () => {
      if (mode === "edit" && id) {
        try {
          const tempForm = localStorage.getItem(`maturityTempForm_${id}`);
          if (tempForm) {
            const parsed = JSON.parse(tempForm);
            setDeskripsi({
              scoreDescription0: parsed.scoreDescription0 || "",
              scoreDescription1: parsed.scoreDescription1 || "",
              scoreDescription2: parsed.scoreDescription2 || "",
              scoreDescription3: parsed.scoreDescription3 || "",
              scoreDescription4: parsed.scoreDescription4 || "",
            });
            setLoading(false);
            return;
          }

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
          console.error("Error loading data:", e);
        }
      }
      setLoading(false);
    };

    setTimeout(loadData, 100);
  }, [id, mode]);

  const allFilled = Object.values(deskripsi).every((desc) => desc.trim() !== "");

  const handleSave = async () => {
    try {
      let tempFormKey = "";
      if (mode === "edit" && id) {
        tempFormKey = `maturityTempForm_${id}`;
      } else if (mode === "add") {
        tempFormKey = "maturityTempForm";
      }

      const tempForm = localStorage.getItem(tempFormKey);
      if (!tempForm) {
        alert("Data form utama tidak ditemukan. Harap kembali ke halaman utama.");
        return;
      }

      const fullFormData = JSON.parse(tempForm);

      if (mode === "edit" && id) {
        const body: UpdateMaturityLevelRequest = {
          name: (fullFormData.name || "").trim(),
          levelNumber: isNaN(Number(fullFormData.levelNumber)) ? 0 : Number(fullFormData.levelNumber),
          minScore: String(fullFormData.minScore || "").trim(),
          maxScore: String(fullFormData.maxScore || "").trim(),
          generalDescription: (fullFormData.generalDescription || "").trim(),
          scoreDescription0: deskripsi.scoreDescription0.trim(),
          scoreDescription1: deskripsi.scoreDescription1.trim(),
          scoreDescription2: deskripsi.scoreDescription2.trim(),
          scoreDescription3: deskripsi.scoreDescription3.trim(),
          scoreDescription4: deskripsi.scoreDescription4.trim(),
        };

        await updateMaturity(Number(id), body);
        localStorage.removeItem(tempFormKey);
        router.push(`/maturity-level/edit-maturity/${id}`);

      } else if (mode === "add") {
        const updatedForm = {
          ...fullFormData,
          scoreDescription0: deskripsi.scoreDescription0.trim(),
          scoreDescription1: deskripsi.scoreDescription1.trim(),
          scoreDescription2: deskripsi.scoreDescription2.trim(),
          scoreDescription3: deskripsi.scoreDescription3.trim(),
          scoreDescription4: deskripsi.scoreDescription4.trim(),
        };

        localStorage.setItem(tempFormKey, JSON.stringify(updatedForm));

        window.dispatchEvent(new Event("storage"));

        router.push("/maturity-level/add-maturity");
      }
    } catch (err) {
      console.error("Failed to process descriptions:", err);
      alert("Gagal memproses deskripsi. Coba lagi.");
    }
  };

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
         <div>
          <div >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            disabled={!allFilled || isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              allFilled ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={handleSave}
          >
            {isLoading ? "Memproses..." : "Simpan"}
          </Button>
        </div>

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