"use client";

import React, { useState } from "react";
import Table from "@/components/Table";
import { Download, Printer, ChevronDown, Copy } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Sidebar from "@/components/sidebar";
import Button  from "@/components/button";


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
  { header: "No", key: "nomor", width: "80px" },
  { header: "Variable", key: "variable", width: "150px" },
  { header: "Indikator", key: "indikator", width: "250px" },
  { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
  { header: "Jawaban", key: "jawaban", width: "150px" },
  { header: "Skor", key: "skor", width: "100px" },
  { header: "Tipe Soal", key: "tipeSoal", width: "150px" },
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
  { name: "🏠 Home", value: "welcome" },
  { name: "📊 Dashboard", value: "dashboard" },
  { name: "📝 Start Assessment", value: "assessment-form" },
  { name: "📊 Assessment Result", value: "asesment-result" },
  { name: "📋 Approval Assessment", value: "approval-assessment" },
  { name: "📘 About IMA", value: "user-manual" },
  { name: "👤 User Management", value: "user-management" },
];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar navItems={navItems} setTab={setTab} activeTab={tab} />

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
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <Copy size={16} className="inline-block"/>
                  <span className="text-sm leading-none">Copy</span>
                </Button>
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

            {/* Table Scrollable */}
              <div className="w-full overflow-x-auto">
                <div className="max-h-[350px] w-[800px] overflow-y-auto">
                  <Table
                    columns={columns}
                    data={paginatedData}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                  />
                </div>
              </div>


            {/* Pagination & Action */}
           <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
              <div className="flex gap-2">
           {/* Tombol ke halaman sebelumnya */}
               <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
               >
                  &lt;
              </button>

           {/* Hanya 1 nomor halaman aktif */}
            <div className="w-8 h-8 flex items-center justify-center border rounded-full font-bold bg-white text-black">
              {currentPage}
              </div>

           {/* Tombol ke halaman berikutnya */}
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
                    onClick={() => {
                    
                    setModalType("approve");
                    setShowModal(true);
                  }}
                  className="px-10 py-2  text-white rounded"
                >
                  Approve
                </Button>

                <Button
                    variant="danger"
                    onClick={() => {
                    setModalType("revisi");
                    setShowModal(true);
                  }}
                  className="px-10 py-2 text-white rounded"
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
                confirmLabel="Ya, saya yakin"
                cancelLabel="Batal"
              />
            </div>
          </div>
        )}
      </div>
  );
};

export default TablePage;