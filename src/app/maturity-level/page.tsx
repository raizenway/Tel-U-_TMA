"use client";

import { useState } from "react";
import Table from "@/components/Table";
import { User, ChevronDown, Download, Printer, Copy, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Button from "@/components/button";
import NotificationBell from "@/components/ui/NotificationBell";
import UniversalDropdown from "@/components/ui/universal-dropdown";
import { useRouter, usePathname } from "next/navigation";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Data asli
  const [data, setData] = useState<any[]>([
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
  ]);

  // Filter data
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / 10);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  // Fungsi aksi
  const handleTambah = () => {
    router.push("/formmaturity");
  };

  const handleEdit = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    router.push(`/edit-maturity/${realIndex}`);
  };

  const handleDelete = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    const rowNumber = realIndex + 1;
    if (confirm(`Yakin ingin menghapus baris ke-${rowNumber}?`)) {
      const newData = [...data];
      newData.splice(realIndex, 1);
      setData(newData);
      alert(`🗑️ Baris ke-${rowNumber} berhasil dihapus.`);
      if (newData.length < currentPage * 10 && currentPage > 1 && paginatedData.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const headers = ["Level", "Nama Level", "Skor Minimum", "Skor Maximum", "Deskripsi Umum"];
    const rows = filteredData
      .map((row, i) => [
        i + 1,
        row.namalevel,
        row.skorminimum,
        row.skormaximum,
        row.deskripsiumum,
      ].join("\t"))
      .join("\n");

    const tsv = headers.join("\t") + "\n" + rows;
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maturity-level.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const headers = ["Level", "Nama Level", "Skor Minimum", "Skor Maximum", "Deskripsi Umum"];
    const rows = filteredData
      .map((row, i) => [
        i + 1,
        row.namalevel,
        row.skorminimum,
        row.skormaximum,
        row.deskripsiumum,
      ].join("\t"))
      .join("\n");

    const textToCopy = headers.join("\t") + "\n" + rows;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("✅ Data berhasil disalin ke clipboard!");
    });
  };

  // 🔧 Tambahkan kolom "aksi" ke data (tanpa ubah Table.tsx)
  const dataDenganAksi = paginatedData.map((row, index) => ({
    ...row,
    // Auto-increment Level
    level: (currentPage - 1) * 10 + index + 1,
    // Kolom aksi: JSX langsung
    aksi: (
      <div className="flex justify-center gap-4 text-xs">
        <button
          onClick={() => handleEdit(index)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => handleDelete(index)}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    ),
  }));

  // Kolom tabel — tidak perlu render, hanya daftar key
  const columns = [
    { header: "Level", key: "level", width: "60px" },
    { header: "Nama Level", key: "namalevel", width: "200px" },
    { header: "Skor Minimum", key: "skorminimum", width: "160px" },
    { header: "Skor Maximum", key: "skormaximum", width: "160px" },
    { header: "Deskripsi Umum", key: "deskripsiumum", width: "250px" },
    { header: "Aksi", key: "aksi", width: "160px" },
  ];

  // Untuk sidebar & navbar
  const pathname = usePathname();
  const handleNavClick = (item: any) => {
    if (item.path) router.push(`/${item.path}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onItemClick={handleNavClick} />
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
              <UniversalDropdown.Item label="Profil" onClick={() => {}} />
              <UniversalDropdown.Item label="Logout" onClick={() => {}} />
            </UniversalDropdown>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="p-6 bg-white rounded-xl shadow m-6 space-y-4">
          {/* Search & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Cari..."
              className="border px-3 py-2 rounded-md w-full max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs">
                <Copy size={14} /> Copy
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs">
                <Printer size={14} /> Print
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs">
                <Download size={14} /> Download
              </button>
              <Button variant="primary" onClick={handleTambah} className="text-xs">
                + Tambah Maturity
              </Button>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto max-h-[300px]">
            <Table
              columns={columns}
              data={dataDenganAksi} 
              currentPage={currentPage}
              rowsPerPage={10}
            />
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 border rounded-full disabled:opacity-50"
              >
                {"<"}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 border rounded-full ${
                    currentPage === i + 1 ? "bg-blue-100 font-bold" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 border rounded-full disabled:opacity-50"
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