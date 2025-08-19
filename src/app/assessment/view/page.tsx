"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { ArrowLeft } from "lucide-react";

export default function ViewAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allResults = JSON.parse(localStorage.getItem("assessmentResults") || "[]");
    const item = allResults.find((r) => r.id.toString() === id);
    if (item) {
      setData(item);
    } else {
      alert("Data tidak ditemukan.");
      router.push("/assessment/assessmenttable");
    }
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Memuat...</p>
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

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detail Assessment</h1>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-blue-700">{data.unit}</h2>
        <p className="text-sm text-gray-600 mt-1">Tanggal Submit: {data.tanggal}</p>
        <p className="mt-4">
          <strong>Status:</strong>{" "}
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {data.status || "Submitted"}
          </span>
        </p>
        <p>
          <strong>Total Jawaban Terisi:</strong> {data.totalTerisi}
        </p>

        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
          <h3 className="font-semibold border-b pb-2">Riwayat Jawaban</h3>
          {data.data?.map((item, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-gray-50 flex justify-between"
            >
              <div>
                <span className="font-medium">No {item.no}</span> - {item.kode}
              </div>
              <span className={item.status === "Terisi" ? "text-green-600" : "text-red-500"}>
                {item.jawaban}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}