"use client";

import React, { useState } from "react";
import Table from "@/components/Table";

import { Download, Printer, ChevronDown } from "lucide-react";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const campusOptions = [
    "Tel-U Jakarta",
    "Tel-U Bandung",
    "Tel-U Surabaya",
    "Tel-U Purwokerto",
  ];

  const columns = [
    { header: "Nomor", key: "nomor" },
    { header: "Nama Variable", key: "variable" },
    { header: "Indikator", key: "indikator" },
    { header: "Pertanyaan", key: "pertanyaan" },
    { header: "Jawaban", key: "jawaban" },
    { header: "Skor", key: "skor" },
    { header: "Tipe Soal", key: "tipeSoal" },
  ];

  const data = [
    {
      nomor: 1,
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda"
    },
    {
      nomor: 2,
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian"
    },
  ];

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const csv =
      columns.map((col) => col.header).join(",") +
      "\n" +
      filteredData
        .map((row) => columns.map((col) => `"${row[col.key] || ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tabel.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      {/* Header: search, tombol, dropdown */}
      <div className="flex flex-wrap justify-between gap-4">
        <input
          type="text"
          placeholder="Cari"
          className="border px-3 py-2 rounded-md w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-2 items-center relative">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Download size={16} />
            Download
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {selectedCampus}
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-10">
                {campusOptions.map((campus) => (
                  <div
                    key={campus}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCampus(campus);
                      setDropdownOpen(false);
                    }}
                  >
                    {campus}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table with persistent scroll */}
      <div className="overflow-x-auto w-full">
        <Table columns={columns} data={paginatedData} />
      </div>

      {/* Pagination & Actions */}
      <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center border rounded-full ${currentPage === i + 1 ? "bg-gray-200 font-bold" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        <div className="flex gap-2">
  <button
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    onClick={() => alert("Data telah disetujui")}
  >
    Approve
  </button>
  <button
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    onClick={() => alert("Data dikembalikan untuk revisi")}
  >
    Revisi
  </button>
</div>

      </div>
    </div>
  );
};

export default TablePage;
