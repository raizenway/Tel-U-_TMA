"use client";

import { useState, useEffect } from "react";
import Table from "@/components/Table";
import { Copy, Printer, Download, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import { Plus, Eye } from "lucide-react";


const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  // Ambil data dari localStorage atau dummy data
  useEffect(() => {
    const savedData = localStorage.getItem("maturityData");
    if (savedData) {
      setData(JSON.parse(savedData));
    } else {
      const defaultData = [
        {
          level: "1",
          namaLevel: "Very Low Maturity",
          skorMin: "0%",
          skorMax: "24.9%",
          deskripsiUmum:
            "Sangat belum siap otonomi dan perlu ada perubahan signifikan segera",
          deskripsiPerVariabel: "Lihat Deskripsi",
        },
        {
          level: "2",
          namaLevel: "Low Maturity",
          skorMin: "25%",
          skorMax: "49.9%",
          deskripsiUmum:
            "Belum siap otonomi dan ada yang harus ditingkatkan segera",
          deskripsiPerVariabel: "Lihat Deskripsi",
        },
        {
          level: "3",
          namaLevel: "Medium Maturity",
          skorMin: "50%",
          skorMax: "74.9%",
          deskripsiUmum:
            "Sudah siap otonomi level 2, dan masih ada yang perlu ditingkatkan",
          deskripsiPerVariabel: "Lihat Deskripsi",
        },
      ];
      setData(defaultData);
      localStorage.setItem("maturityData", JSON.stringify(defaultData));
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("maturityData", JSON.stringify(data));
    }
  }, [data]);

  // Filter pencarian
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

  // Fungsi tombol aksi
  const handleTambah = () => {
    router.push("/maturity-level/add-maturity");
  };

  const handleEdit = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    router.push(`/maturity-level/edit-maturity/${realIndex}`);
  };

  const handleDelete = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    const newData = [...data];
    newData.splice(realIndex, 1);
    setData(newData);
    setShowDelete(false);
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const headers = [
      "Level",
      "Nama Level",
      "Skor Minimum",
      "Skor Maximum",
      "Deskripsi Umum",
      "Deskripsi Per Variabel",
    ];
    const rows = filteredData
      .map((row) => [
        row.level,
        row.namaLevel,
        row.skorMin,
        row.skorMax,
        row.deskripsiUmum,
        row.deskripsiPerVariabel,
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
    const headers = [
      "Level",
      "Nama Level",
      "Skor Minimum",
      "Skor Maximum",
      "Deskripsi Umum",
      "Deskripsi Per Variabel",
    ];
    const rows = filteredData
      .map((row) => [
        row.level,
        row.namaLevel,
        row.skorMin,
        row.skorMax,
        row.deskripsiUmum,
        row.deskripsiPerVariabel,
      ].join("\t"))
      .join("\n");

    const textToCopy = headers.join("\t") + "\n" + rows;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("✅ Data berhasil disalin ke clipboard!");
    });
  };

  // Data + kolom aksi
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
          onClick={() => {
            setDeleteIndex(index);
            setShowDelete(true);
          }}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    ),
  }));

  const columns = [
    { header: "Level", key: "level", width: "60px" },
    { header: "Nama Level", key: "namaLevel", width: "200px" },
    { header: "Skor Minimum", key: "skorMin", width: "160px" },
    { header: "Skor Maximum", key: "skorMax", width: "160px" },
    { header: "Deskripsi Umum", key: "deskripsiUmum", width: "250px" },
    { header: "Deskripsi Per Variabel", key: "deskripsiPerVariabel", width: "250px" },
    { header: "Aksi", key: "aksi", width: "160px" },
  ];

  return (
    <div className="bg-white p-2 max-w-fit mx-auto rounded">
      <div className="p-6 bg-white rounded-xl shadow m-6 space-y-4 mt-20 p-8">
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
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs"
            >
              <Copy size={14} /> Copy
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 border px-2 py-2 rounded hover:bg-gray-100 text-xs"
            >
              <Download size={14} /> Download
            </button>
            <Button onClick={handleTambah}>Tambah Maturity</Button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto w-full">
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 border rounded-full disabled:opacity-50"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal konfirmasi hapus */}
      <ModalConfirm
        isOpen={showDelete}
        onConfirm={() => {
          if (deleteIndex !== null) {
            handleDelete(deleteIndex);
          }
        }}
        onCancel={() => setShowDelete(false)}
        title="Apakah kamu yakin, akan menghapus data?"
        header="Konfirmasi "
        confirmLabel="Ya, lakukan"
        cancelLabel="Batal"
      >
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-left text-sm">
          <div className="font-bold mb-1">⚠ Peringatan</div>
          <div>Data yang sudah dihapus tidak akan bisa dipulihkan.</div>
        </div>
      </ModalConfirm>
    </div>
  );
};

export default TablePage;
