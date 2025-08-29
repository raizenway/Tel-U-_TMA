"use client";

import React, { useState, useMemo } from "react";
import TableUpdate from "@/components/TableUpdate";
import { Printer, ChevronDown, Copy } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import * as XLSX from "xlsx";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [tab, ] = useState("approval-assessment");

  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const rowsPerPage = 10;

  const campusOptions = [
    "Tel-U Jakarta",
    "Tel-U Bandung",
    "Tel-U Surabaya",
    "Tel-U Purwokerto",
  ];

  const columns = [
    { header: "Nomor", key: "nomor", width: "100px", sortable: true },
    { header: "Nama Variable", key: "variable", width: "300px", sortable: true },
    { header: "Indikator", key: "indikator", width: "319px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "319px" },
    { header: "Jawaban", key: "jawaban", width: "120px" },
    { header: "Skor", key: "skor", width: "319px" },
    { header: "Tipe Soal", key: "tipeSoal", width: "160px" },
  ];

  // Data dummy
  const data = Array.from({ length: 20 }, (_, i) => ({
    variable: i % 2 === 0 ? "V1 (Mutu)" : "V4 (Sarana & Prasarana)",
    indikator:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC"
        : "Luas perpustakaan di TUNC (m2)",
    pertanyaan:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC oleh lembaga internasional"
        : "Luas perpustakaan di TUNC (m2)",
    jawaban: i % 2 === 0 ? "2" : "300",
    skor: i % 2 === 0 ? "2" : "4",
    tipeSoal: i % 2 === 0 ? "Pilihan Ganda" : "Isian",
  }));

  // 🔍 search
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 🔽 sorting
  const sortedData = useMemo(() => {
    const sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aVal = sortConfig.key === "nomor"
          ? filteredData.indexOf(a) + 1
          : a[sortConfig.key];
        const bVal = sortConfig.key === "nomor"
          ? filteredData.indexOf(b) + 1
          : b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // 📄 pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ⬇️ handle sort klik header
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const worksheetData = [
      columns.map((col) => col.header),
      ...paginatedData.map((row, index) =>
        columns.map((col) => {
          if (col.key === "nomor")
            return (currentPage - 1) * rowsPerPage + index + 1;
          return row[col.key] || "";
        })
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!cols"] = columns.map((col) => ({
      wch: parseInt(col.width) / 5,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assessment Data");
    XLSX.writeFile(workbook, `assessment_data_page_${currentPage}.xlsx`);
  };

  const handleCopy = () => {
    const textToCopy =
      columns.map((col) => col.header).join("\t") +
      "\n" +
      filteredData
        .map((row, i) =>
          columns
            .map((col) =>
              col.key === "nomor" ? i + 1 : row[col.key] || ""
            )
            .join("\t")
        )
        .join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Data berhasil disalin ke clipboard!");
    });
  };

  const handleConfirm = () => {
    alert(
      `Data telah ${
        modalType === "approve" ? "disetujui" : "dikirim untuk revisi"
      }`
    );
    setShowModal(false);
    setModalType(null);
  };

  return (
    <div className="flex min-h-screen">
      {tab === "approval-assessment" && (
        <div className="bg-white rounded-xl shadow m-6 w-full">
          {/* Filter & Tools */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Cari"
              className="border px-3 py-2 rounded-md w-full max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-2 items-center">
              <Button variant="outline" icon={Copy} onClick={handleCopy}>
                Copy
              </Button>
              <Button variant="outline" icon={Printer} onClick={handlePrint}>
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

              {/* Dropdown Kampus */}
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

       
    <TableUpdate
      columns={columns}
      data={paginatedData}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onSort={handleSort}
      sortConfig={sortConfig}
    />



          {/* Pagination & Actions */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                &lt;
              </button>
              <div className="w-8 h-8 flex items-center justify-center border rounded-full font-bold bg-white text-black">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                &gt;
              </button>
            </div>

            <div className="flex gap-6">
              <Button
                variant="success"
                className="px-13"
                onClick={() => {
                  setModalType("approve");
                  setShowModal(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="px-13"
                onClick={() => {
                  setModalType("revisi");
                  setShowModal(true);
                }}
              >
                Revisi
              </Button>
            </div>

            <ModalConfirm
              isOpen={showModal}
              onCancel={() => {
                setShowModal(false);
                setModalType(null);
              }}
              onConfirm={handleConfirm}
              title={`Apakah kamu yakin ingin ${
                modalType === "approve" ? "melakukan approval" : "melakukan revisi"
              } pada data ini?`}
              header="Konfirmasi"
              confirmLabel="Ya, lakukan"
              cancelLabel="Batal"
            />
          
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePage;
