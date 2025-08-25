// components/TablePage.tsx
"use client";

import React, { useState } from "react";
import TableUpdate from "@/components/TableUpdate";
import Button from "@/components/button";
import { useRouter } from "next/navigation";

export default function TablePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // 🔽 Kolom dengan sorting dan className
  const columns = [
    { header: "Nomor", key: "nomor", width: "60px", className: "text-center", sortable: true },
    { header: "Nama Variable", key: "variable", width: "180px", sortable: true },
    { header: "Indikator", key: "indikator", width: "250px"  },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px"  },
    { header: "Deskripsi Skor 0", key: "deskripsiSkor0", width: "200px"  },
    { header: "Deskripsi Skor 1", key: "deskripsiSkor1", width: "200px"  },
    { header: "Deskripsi Skor 2", key: "deskripsiSkor2", width: "200px" },
    { header: "Deskripsi Skor 3", key: "deskripsiSkor3", width: "200px"  },
    { header: "Deskripsi Skor 4", key: "deskripsiSkor4", width: "200px"  },
    { header: "Tipe Soal", key: "tipeSoal", width: "140px", className: "text-center" },
    {
  header: "AKSI",
  key: "action",
  width: "160px", // ✅ lebih lebar
  className: "text-center sticky right-0 border border-gray-200 z-10 bg-gray-100",
  sortable: false,
},
  ];

  // 🔢 Data dummy
  const data = Array.from({ length: 15 }, (_, i) => ({
    variable: i % 2 === 0 ? "V1 (Mutu)" : "V4 (Sarana & Prasarana)",
    indikator:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC"
        : "Luas perpustakaan di TUNC (m2)",
    pertanyaan:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC oleh lembaga internasional"
        : "Luas perpustakaan di TUNC (m2)",
    deskripsiSkor0: "Tidak ada",
    deskripsiSkor1: "Minimal",
    deskripsiSkor2: "Sedang",
    deskripsiSkor3: "Baik",
    deskripsiSkor4: "Sangat Baik",
    tipeSoal: i % 2 === 0 ? "Pilihan Ganda" : "Isian",
  }));

  // 🔍 Filter data
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ✏️ Edit handler
  const handleEdit = (id: number) => {
    console.log("Edit item nomor:", id);
    // router.push(`/edit/${id}`);
  };

  // ⚠️ Deactivate handler
  const handleDeactivate = (index: number) => {
    if (confirm("Yakin ingin menonaktifkan item ini?")) {
      alert(`Item nomor ${index + 1} dinonaktifkan`);
    }
  };

  // ✅ Reactivate handler
  const handleReactivate = (index: number) => {
    alert(`Item nomor ${index + 1} diaktifkan kembali`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow m-6 mt-20 w-full">
      {/* Header */}
      <div className="flex justify-end items-center mb-6 ">
       
        <Button
          variant="primary"
          onClick={() => router.push("/create")}
          className="px-4 py-2"
        >
          + Tambah Pertanyaan
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari..."
          className="border px-3 py-2 rounded-md w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <TableUpdate
        columns={columns}
        data={paginatedData}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
      />

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<"} Sebelumnya
          </button>

          <span className="px-3 py-1 border rounded font-medium">
            {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Selanjutnya {">"}
          </button>
        </div>
      </div>
    </div>
  );
}