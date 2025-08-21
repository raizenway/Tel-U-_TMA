"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { ArrowLeft } from "lucide-react";

// 🔹 Tipe untuk satu jawaban
interface Answer {
  no: number;
  kode: string;
  pertanyaan: string;
  jawaban: string;
  status: "Terisi" | "Kosong";
}

// 🔹 Tipe untuk data assessment
interface AssessmentResult {
  id: number;
  unit: string;
  tanggal: string;
  totalTerisi: number;
  data: Answer[];
}

export default function EditAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("assessmentResults");
      const allResults: AssessmentResult[] = saved ? JSON.parse(saved) : [];

      const item = allResults.find((r: AssessmentResult) => r.id.toString() === id);

      if (item) {
        setData(item);
      } else {
        alert("Data tidak ditemukan.");
        router.push("/assessment/assessmenttable");
      }
    } catch (e) {
      console.error("Gagal parsing data:", e);
      alert("Terjadi kesalahan saat memuat data.");
      router.push("/assessment/assessmenttable");
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button
        variant="outline"
        icon={ArrowLeft}
        iconPosition="left"
        onClick={() => router.back()}
        className="mb-6"
      >
        Kembali
      </Button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Assessment</h1>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-blue-700">{data.unit}</h2>
        <p className="text-sm text-gray-600 mt-1">Tanggal: {data.tanggal}</p>
        <p className="mt-4">
          <strong>Total Soal Terisi:</strong> {data.totalTerisi}
        </p>

        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
          <h3 className="font-semibold border-b pb-2">Detail Jawaban</h3>
          {data.data?.map((item: Answer, index: number) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-gray-50 flex justify-between"
            >
              <span className="font-medium">No {item.no}</span>
              <span className={item.status === "Terisi" ? "text-green-600" : "text-red-500"}>
                {item.jawaban}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="primary"
          onClick={() => alert("Simpan perubahan (fitur simpan bisa ditambahkan)")}
        >
          Simpan Perubahan
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </div>
  );
}