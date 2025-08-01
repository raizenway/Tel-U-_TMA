"use client";

import React, { useState } from "react";
import Table from "@/components/Table";
import { Download, Printer, ChevronDown, Copy } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import TopbarHeader from "@/components/TopbarHeader";
import Sidebar from "@/components/sidebar";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [tab, setTab] = useState("approval-assessment");

  const rowsPerPage = 10;

  const campusOptions = [
    "Tel-U Jakarta",
    "Tel-U Bandung",
    "Tel-U Surabaya",
    "Tel-U Purwokerto",
  ];

  const columns = [
  { header: "No", key: "nomor", width: "41px",  },
  { header: "Variable", key: "variable", width: "160px" },
  { header: "Indikator", key: "indikator", width: "319px" },
  { header: "Pertanyaan", key: "pertanyaan", width: "319px" },
  { header: "Jawaban", key: "jawaban", width: "126px" },
  { header: "Skor", key: "skor", width: "319px",   },
  { header: "Tipe Soal", key: "tipeSoal", width: "160px",  },
];


  const data = [
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
    },
    {
      variable: "V1 (Mutu)",
      indikator: "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC",
      pertanyaan:
        "Jumlah sertifikasi/akreditasi dalam lingkup Direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
      jawaban: "2",
      skor: "2",
      tipeSoal: "Pilihan Ganda",
    },
    {
      variable: "V4 (Sarana & Prasarana)",
      indikator: "Luas perpustakaan di TUNC (m2)",
      pertanyaan: "Luas perpustakaan di TUNC (m2)",
      jawaban: "300",
      skor: "4",
      tipeSoal: "Isian",
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

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const tsv =
      columns.map((col) => col.header).join("\t") +
      "\n" +
      filteredData
        .map((row, i) =>
          columns.map((col) =>
            col.key === "nomor"
              ? i + 1
              : row[col.key] || ""
          ).join("\t")
        ).join("\n");

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
          columns.map((col) =>
            col.key === "nomor"
              ? i + 1
              : row[col.key] || ""
          ).join("\t")
        ).join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Data berhasil disalin ke clipboard!");
    });
  };

  const handleConfirm = () => {
    alert(`Data telah ${modalType === "approve" ? "disetujui" : "dikirim untuk revisi"}`);
    setShowModal(false);
    setModalType(null);
  };

  const navItems = [
    { name: "\ud83c\udfe0 Home", value: "welcome" },
    { name: "\ud83d\udcca Dashboard", value: "dashboard" },
    { name: "\ud83d\udcdd Start Assessment", value: "assessment-form" },
    { name: "\ud83d\udcca Assessment Result", value: "asesment-result" },
    { name: " Approval Assessment", value: "approval-assessment" },
    { name: "\ud83d\udcd8 About IMA", value: "user-manual" },
    { name: "\ud83d\udc64 User Management", value: "user-management" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar navItems={navItems} setTab={setTab} activeTab={tab} />

      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-6">
          <TopbarHeader />
        </div>

        {tab === "approval-assessment" && (
          <div className="p-6 bg-white rounded-xl shadow m-6 space-y-4">
            {/* Filter dan tombol kanan */}
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
                  <Copy size={16} />
                  Copy
                </button>
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

            {/* Table */}
            <div className="overflow-x-auto w-[800px] h-[350px]">
              <Table
                columns={columns}
                data={paginatedData}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>

            {/* Pagination & Action */}
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
                  &gt;
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalType("approve");
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    setModalType("revisi");
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Revisi
                </button>
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
                confirmLabel="Ya, saya yakin"
                cancelLabel="Batal"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePage;