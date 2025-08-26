// components/TablePage.tsx
"use client";

import React, { useState } from "react";
import TableUpdate from "@/components/TableUpdate";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, Printer } from "lucide-react"; // ✅ Tambah Printer
import * as XLSX from 'xlsx'; // ✅ Import xlsx

export default function TablePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const columns = [
    { header: "Nomor", key: "nomor", width: "100px", className: "text-center", sortable: true },
    { header: "Nama Variable", key: "variable", width: "180px", sortable: true },
    { header: "Indikator", key: "indikator", width: "250px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
    { header: "Deskripsi Skor 0", key: "deskripsiSkor0", width: "200px", sortable: true },
    { header: "Deskripsi Skor 1", key: "deskripsiSkor1", width: "200px" },
    { header: "Deskripsi Skor 2", key: "deskripsiSkor2", width: "200px" },
    { header: "Deskripsi Skor 3", key: "deskripsiSkor3", width: "200px" },
    { header: "Deskripsi Skor 4", key: "deskripsiSkor4", width: "200px" },
    { header: "Tipe Soal", key: "tipeSoal", width: "140px", className: "text-center", sortable: true },
    {
      header: "AKSI",
      key: "action",
      width: "160px",
      className: "text-center sticky right-0 border border-gray-200 z-10 bg-gray-100",
      sortable: false,
    },
  ];

  // Tambahkan `nomor` ke data
  const rawData = Array.from({ length: 15 }, (_, i) => ({
    nomor: i + 1,
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
    status: "Active",
  }));

  // ✅ 1. Filter data
  const filteredData = rawData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ✅ 2. Sorting
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ✅ 3. Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  // ✅ 4. Handlers
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  // ✅ Handle Copy (pakai filteredData, bukan filteredUsers)
  const handleCopy = () => {
    const header = columns.map(col => col.header).join(',') + '\n';
    const rows = paginatedData.map(row =>
      columns.map(col => {
        if (col.key === "nomor") {
          return (currentPage - 1) * itemsPerPage + paginatedData.indexOf(row) + 1;
        }
        return row[col.key] || "";
      }).join(',')
    ).join('\n');

    const csv = header + rows;
    navigator.clipboard.writeText(csv).then(() => {
      alert('Data berhasil disalin ke clipboard!');
    });
  };

  // ✅ Handle Print
  const handlePrint = () => {
    window.print();
  };

  // ✅ Handle Download Excel
  const handleDownload = () => {
    const worksheetData = [
      columns.map(col => col.header), // Header
      ...paginatedData.map(row =>
        columns.map(col => {
          if (col.key === "nomor") {
            return (currentPage - 1) * itemsPerPage + paginatedData.indexOf(row) + 1;
          }
          return row[col.key] || "";
        })
      )
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = columns.map(col => ({
      wch: parseInt(col.width || '100') / 5, // estimasi lebar
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Data Halaman ${currentPage}`);
    XLSX.writeFile(workbook, `data_assessment_halaman_${currentPage}.xlsx`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow m-6 mt-20 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            icon={Copy}
            iconPosition="left"
            onClick={handleCopy}
          >
            Copy
          </Button>

          <Button
            variant="outline"
            icon={Printer}
            iconPosition="left"
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="outline"
            icon={ChevronDown}
            iconPosition="right"
            onClick={handleDownload}
          >
            Download
          </Button>

          <Button
            variant="primary"
            onClick={() => router.push("/create")}
            className="px-5 py-2 whitespace-nowrap flex items-center justify-center gap-1"
          >
            <span className="font-bold">+</span>
            Tambah Pertanyaan
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableUpdate
        columns={columns}
        data={paginatedData}
        currentPage={currentPage}
        rowsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onSort={handleSort}
        sortConfig={sortConfig}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 px-4">
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 rounded-full px-2 py-1 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5 Data</option>
            <option value={10}>10 Data</option>
            <option value={20}>20 Data</option>
            <option value={50}>50 Data</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
          >
            {"<"}
          </button>
          <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500">
            {currentPage}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
          >
            {">"}
          </button>
        </div>

        <div className="text-sm text-gray-600">Total: {totalItems}</div>
      </div>
    </div>
  );
}