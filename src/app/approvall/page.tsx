"use client";

import React, { useState } from "react";
import Table from "@/components/Table";
import { Download, Printer, ChevronDown, Copy } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [tab, setTab] = useState("approval-assessment");

  const rowsPerPage = 10;

  const campusOptions = [
    "Tel-U Jakarta",
    "Tel-U Bandung",
    "Tel-U Surabaya",
    "Tel-U Purwokerto",
  ];

  const columns = [
  { header: "No", key: "nomor", width: "60px" },
  { header: "Variable", key: "variable", width: "160px" },
  { header: "Indikator", key: "indikator", width: "320px" },
  { header: "Pertanyaan", key: "pertanyaan", width: "320px" },
  { header: "Jawaban", key: "jawaban", width: "120px" },
  { header: "Skor", key: "skor", width: "320px" },
];


  // Contoh data dummy (biar gampang test)
  const data = Array.from({ length: 20 }, (_, i) => ({
    variable: i % 2 === 0 ? "V1 (Mutu)" : "V4 (Sarana & Prasarana)",
    indikator:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC"
        : "Luas perpustakaan di TUNC (m2)",
    pertanyaan:
      i % 2 === 0
        ? "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi"
        : "Luas perpustakaan di TUNC (m2)",
    jawaban: i % 2 === 0 ? "2" : "300",
    skor: i % 2 === 0 ? "2" : "4",
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

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const tsv =
      columns.map((col) => col.header).join("\t") +
      "\n" +
      filteredData
        .map((row, i) =>
          columns
            .map((col) => (col.key === "nomor" ? i + 1 : row[col.key] || ""))
            .join("\t")
        )
        .join("\n");

    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tabel.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const textToCopy =
      columns.map((col) => col.header).join("\t") +
      "\n" +
      filteredData
        .map((row, i) =>
          columns
            .map((col) => (col.key === "nomor" ? i + 1 : row[col.key] || ""))
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
    <div className="flex min-h-screen bg-gray-100">
      {tab === "approval-assessment" && (
        <div className="p-6 bg-white rounded-xl shadow m-6 mt-20 w-full">
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
              <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy}>
                Copy
              </Button>
              <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint}>
                Print
              </Button>
              <Button variant="outline" icon={Download} iconPosition="left" onClick={handleDownload}>
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

          <div className="border rounded-lg" style={{ maxHeight: "500px" }}>
            {/* Scroll horizontal paling luar */}
            <div style={{ overflowX: "scroll" }}>
              {/* Scroll vertical di dalam */}
              <div style={{ maxHeight: "500px", overflowY: "auto"  }}>
                <Table
                  columns={columns}
                  data={paginatedData}
                  currentPage={currentPage}
                  rowsPerPage={rowsPerPage}
                />
              </div>
            </div>
          </div>


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
