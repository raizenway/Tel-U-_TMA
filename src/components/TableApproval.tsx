"use client";
import { useState } from "react";
import { Check, Copy, Printer, ChevronDown, User } from "lucide-react";
import "../styles/freeze-aksi.css";

interface DataItem {
  id: number;
  variable: string;
  indikator: string;
  pertanyaan: string;
  jawaban: string;
  skor: string;
  tipeSoal: string;
}

// Komponen User Dropdown (pojok kanan atas)
function UserDropdown() {
  return (
    <button
      className="w-[81px] h-[40px] border border-gray-300 rounded-md flex items-center justify-between px-3 hover:bg-gray-100 transition"
    >
      <User size={20} className="text-gray-700" />
      <ChevronDown size={16} className="text-gray-500" />
    </button>
  );
}

export default function TableApproval() {
  const [filter, setFilter] = useState<string>("Tel-U Jakarta");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dataPerPage, setDataPerPage] = useState<number>(10);

  const [data, setData] = useState<DataItem[]>([
    {
      id: 1,
      variable: "V1",
      indikator: "Indikator 1",
      pertanyaan: "Apakah Anda puas?",
      jawaban: "Ya",
      skor: "6",
      tipeSoal: "Pilihan Ganda",
    },
    {
      id: 2,
      variable: "V2",
      indikator: "Indikator 2",
      pertanyaan: "Apakah layanan cepat?",
      jawaban: "Cukup",
      skor: "4",
      tipeSoal: "Skala Likert",
    },
  ]);

  const totalPage = Math.max(1, Math.ceil(data.length / dataPerPage));
  const indexOfLast = currentPage * dataPerPage;
  const indexOfFirst = indexOfLast - dataPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  const handleApproval = (id: number) => {
    alert(`Data dengan ID ${id} disetujui`);
  };

  const handleRevision = (id: number) => {
    alert(`Data dengan ID ${id} diminta revisi`);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPage) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
      {/* User dropdown pojok kanan atas */}
      <div className="flex justify-end mb-4">
        <UserDropdown />
      </div>

      {/* Filter dan tombol */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Cari"
          className="border px-3 py-1 rounded w-1/4"
        />
        <div className="flex gap-2">
          <button className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1">
            <Copy size={16} />
            Copy
          </button>
          <button className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1">
            <Printer size={16} />
            Print
          </button>
          <button className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1">
            Download
            <ChevronDown size={16} />
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="Tel-U Jakarta">Tel-U Jakarta</option>
            <option value="Tel-U Bandung">Tel-U Bandung</option>
             <option value="Tel-U Surabaya">Tel-U Surabaya</option>
            <option value="Tel-U Purwokerto">Tel-U Purwokerto</option>
          </select>
        </div>
      </div>

      {/* TABEL */}
      <div className="overflow-x-auto custom-scroll">
        <table className="w-full min-w-[1200px] text-sm border relative">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-2 py-1 w-10 text-center">Nomor</th>
              <th className="border px-2 py-1 smaller">Nama Variabel</th>
              <th className="border px-2 py-1 smaller break-words">Indikator</th>
              <th className="border px-2 py-1 smaller break-words">Pertanyaan</th>
              <th className="border px-2 py-1 smaller">Jawaban</th>
              <th className="border px-2 py-1 smaller break-words">Skor</th>
              <th className="border px-2 py-1 smaller break-words">Tipe Soal</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data yang tersedia
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1 text-center sticky left-0 z-10 bg-inherit">
                    {(currentPage - 1) * dataPerPage + index + 1}
                  </td>
                  <td className="border px-2 py-1 smaller">{item.variable}</td>
                  <td className="border px-2 py-1 smaller break-words">{item.indikator}</td>
                  <td className="border px-2 py-1 smaller whitespace-normal break-words">
                    {item.pertanyaan}
                  </td>
                  <td className="border px-2 py-1 smaller">{item.jawaban}</td>
                  <td className="border px-2 py-1 smaller break-words">{item.skor}</td>
                  <td className="border px-2 py-1 smaller break-words">{item.tipeSoal}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: Pagination & Aksi */}
      <div className="flex justify-between items-center mt-4 text-sm">
        {/* Pagination */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm ${
              currentPage === 1
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 border-gray-300"
            }`}
          >
            &lt;
          </button>
          {Array.from({ length: totalPage }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageClick(i + 1)}
              className={`w-8 h-8 rounded-full text-sm border flex items-center justify-center ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white font-semibold border-blue-500"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPage}
            className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm ${
              currentPage === totalPage
                ? "text-gray-300 border-gray-200 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 border-gray-300"
            }`}
          >
            &gt;
          </button>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-4">
          <button
            onClick={() => alert("Semua data disetujui")}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => alert("Revisi diminta")}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Revisi
          </button>
        </div>
      </div>
    </div>
  );
}
