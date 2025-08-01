"use client";

import React, { useState } from "react";
import Table from "@/components/Table";
import { User, ChevronDown, Download, Printer, Copy, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Button from "@/components/button";
import NotificationBell from "@/components/ui/NotificationBell";
import UniversalDropdown from "@/components/ui/universal-dropdown";
import { useRouter } from "next/navigation";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("maturity-level");
  const router = useRouter();

  const rawData = [
    {
      namalevel: "Very Low Maturity",
      skorminimum: "0%",
      skormaximum: "24,9%",
      deskripsiumum:
        "Sangat belum siap otonomi dan perlu ada perubahan signifikan segera",
    },
    {
      namalevel: "Low Maturity",
      skorminimum: "25%",
      skormaximum: "49,9%",
      deskripsiumum:
        "Belum siap otonomi dan ada yang harus ditingkatkan segera",
    },
    {
      namalevel: "Medium Maturity",
      skorminimum: "50%",
      skormaximum: "74,9%",
      deskripsiumum:
        "Sudah siap otonomi level 2, dan masih ada yang perlu ditingkatkan",
    },
  ];

  const filteredData = rawData.filter((row) =>
    Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / 10);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const headers = columns.map((col) => col.header).join("\t");
    const rows = filteredData
      .map((row, i) =>
        columns
          .map((col) =>
            col.key === "level" ? i + 1 : (row as any)[col.key] || ""
          )
          .join("\t")
      )
      .join("\n");

    const tsv = headers + "\n" + rows;
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maturity-level.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const headers = columns.map((col) => col.header).join("\t");
    const rows = filteredData
      .map((row, i) =>
        columns
          .map((col) =>
            col.key === "level" ? i + 1 : (row as any)[col.key] || ""
          )
          .join("\t")
      )
      .join("\n");

    const textToCopy = headers + "\n" + rows;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("✅ Data berhasil disalin ke clipboard!");
    });
  };

  const handleTambah = () => {
    router.push("/tambah-maturity");
  };

  const handleEdit = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    const rowNumber = realIndex + 1;
    console.log("Edit row at index:", realIndex, "Row number:", rowNumber);
    router.push(`/edit-maturity/${realIndex}`); // Asumsi Anda punya halaman edit
  };

  const handleDelete = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    const rowNumber = realIndex + 1;
    const confirmed = confirm(`Yakin ingin menghapus baris ke-${rowNumber}?`);
    if (confirmed) {
      alert(`🗑️ Baris ke-${rowNumber} berhasil dihapus (simulasi).`);
      // Di sini Anda bisa tambahkan logika hapus dari state jika pakai useState
    }
  };

  const columns = [
    { header: "Level", key: "level", width: "60px" },
    { header: "Nama Level", key: "namalevel", width: "200px" },
    { header: "Skor Minimum", key: "skorminimum", width: "160px" },
    { header: "Skor Maximum", key: "skormaximum", width: "160px" },
    { header: "Deskripsi Umum", key: "deskripsiumum", width: "250px" },
    {
      header: "Aksi",
      key: "aksi",
      width: "160px",
      render: (row: any, index: number) => (
        <div className="flex justify-center gap-3 text-xs">
          <button
            onClick={() => handleEdit(index)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={() => handleDelete(index)}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ),
    },
  ];

  const navItems = [
    { name: "🏠 Home", value: "welcome" },
    { name: "📊 Dashboard", value: "dashboard" },
    { name: "📝 Start Assessment", value: "assessment-form" },
    { name: "📊 Assessment Result", value: "asesment-result" },
    { name: "Maturity Level", value: "maturity-level" },
    { name: "📘 About IMA", value: "user-manual" },
    { name: "👤 User Management", value: "user-management" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar navItems={navItems} setTab={setTab} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6">
          <div className="flex justify-end p-4 gap-4">
            <NotificationBell />
            <UniversalDropdown
              trigger={
                <div className="flex items-center gap-2 border-2 border-[#2C3E50] rounded-xl px-4 py-2 bg-white text-[#2C3E50]">
                  <User size={20} />
                  <ChevronDown size={20} />
                </div>
              }
            >
              <UniversalDropdown.Item label="Profil" onClick={() => console.log("Profil")} />
              <UniversalDropdown.Item label="Logout" onClick={() => console.log("Logout")} />
            </UniversalDropdown>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="p-6 bg-white rounded-xl shadow m-6 space-y-4">
          {/* Search & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Cari"
              className="border px-3 py-2 rounded-md w-full max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-2 items-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <Copy size={16} /> Copy
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <Download size={16} /> Download
              </button>
              <Button variant="primary" onClick={handleTambah}>
                + Tambah Maturity
              </Button>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto max-h-[300px]">
            <Table
              columns={columns}
              data={paginatedData.map((row, index) => ({
                ...row,
                level: (currentPage - 1) * 10 + index + 1,
              }))}
              currentPage={currentPage}
              rowsPerPage={10}
            />
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                {"<"}
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                    currentPage === i + 1 ? "bg-gray-200 font-bold" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;