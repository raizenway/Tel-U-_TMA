"use client";

import { useState, useEffect } from "react";
import Table from "@/components/Table";
import { Copy, Printer, Download, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/button";
import { useRouter, usePathname } from "next/navigation";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  // 🔹 Ambil data dari localStorage saat pertama load
  useEffect(() => {
    const savedData = localStorage.getItem("maturityData");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  // 🔹 Simpan data ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem("maturityData", JSON.stringify(data));
  }, [data]);

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
    router.push("/maturity-level/add-maturity");
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

  // 🔧 Tambahkan kolom aksi
  const dataDenganAksi = paginatedData.map((row, index) => ({
    ...row,
    level: (currentPage - 1) * 10 + index + 1,
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

  const columns = [
    { header: "Level", key: "level", width: "60px" },
    { header: "Nama Level", key: "namalevel", width: "200px" },
    { header: "Skor Minimum", key: "skorminimum", width: "160px" },
    { header: "Skor Maximum", key: "skormaximum", width: "160px" },
    { header: "Deskripsi Umum", key: "deskripsiumum", width: "250px" },
    { header: "Aksi", key: "aksi", width: "160px" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
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
            <Button onClick={handleTambah}>Tambah Maturity</Button>
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
  );
};

export default TablePage;
