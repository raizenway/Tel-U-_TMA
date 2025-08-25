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

  const columns = [
    { header: "Nomor", key: "nomor", width: "100px", className: "text-center", sortable: true },
    { header: "Nama Variable", key: "variable", width: "180px", sortable: true },
    { header: "Indikator", key: "indikator", width: "250px", sortable: true },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
    { header: "Deskripsi Skor 0", key: "deskripsiSkor0", width: "200px", sortable: true },
    { header: "Deskripsi Skor 1", key: "deskripsiSkor1", width: "200px" },
    { header: "Deskripsi Skor 2", key: "deskripsiSkor2", width: "200px" },
    { header: "Deskripsi Skor 3", key: "deskripsiSkor3", width: "200px" },
    { header: "Deskripsi Skor 4", key: "deskripsiSkor4", width: "200px" },
    { header: "Tipe Soal", key: "tipeSoal", width: "140px", className: "text-center" },
    {
      header: "AKSI",
      key: "action",
      width: "160px",
      className: "text-center sticky right-0 border border-gray-200 z-10 bg-gray-100",
      sortable: false,
    },
  ];

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

  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleEdit = (id: number) => {
    console.log("Edit item nomor:", id);
  };

  const handleDeactivate = (index: number) => {
    if (confirm("Yakin ingin menonaktifkan item ini?")) {
      alert(`Item nomor ${index + 1} dinonaktifkan`);
    }
  };

  const handleReactivate = (index: number) => {
    alert(`Item nomor ${index + 1} diaktifkan kembali`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow m-6 mt-20 w-full">
      {/* Header: Search + Button sejajar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cari..."
            className="w-full h-10 border border-gray-300 rounded-lg px-4 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Tambah Pertanyaan Button */}
        <Button
          variant="primary"
          onClick={() => router.push("/create")}
          className="px-5 py-2 whitespace-nowrap flex items-center justify-center gap-1"
        >
          <span className="font-bold">+</span>
          Tambah Pertanyaan
        </Button>
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
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            {"<"} Sebelumnya
          </button>

          <span className="px-3 py-1 border rounded font-medium bg-white">
            {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Selanjutnya {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
