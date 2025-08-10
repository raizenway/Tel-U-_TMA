"use client";

import { useEffect, useState } from "react";
import { FaSchool } from 'react-icons/fa';
import { MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Table from '@/components/Table';
import { BiCopy } from 'react-icons/bi';
import { BsPrinter } from 'react-icons/bs';
import { HiDownload } from 'react-icons/hi';
import { IoIosPaperPlane } from 'react-icons/io';
import SuccessNotification from "@/components/SuccessNotification";
import Button from "@/components/button";

const AssessmentTable = () => {
  const [data, setData] = useState([
    {
      id: 1,
      logo: <FaSchool className="text-blue-600 text-xl" />,
      nama: "Tel-U Jakarta",
      tanggal: "12/04/2025",
      skor: [3, 3, 3, 3],
      hasil: 3,
      status: "Lulus",
      aksi: "edit",
    },
    {
      id: 2,
      logo: <FaSchool className="text-blue-600 text-xl" />,
      nama: "Tel-U Surabaya",
      tanggal: "19/01/2025",
      skor: [3, 3, 3, 3],
      hasil: 3,
      status: "Lulus",
      aksi: "view",
    },
    {
      id: 4,
      logo: <FaSchool className="text-blue-600 text-xl" />,
      nama: "Tel-U Bandung",
      tanggal: "On Progress",
      skor: ["-", "-", "-", "-"],
      hasil: "-",
      status: "Belum Selesai",
      aksi: "progress",
    },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedMessage = localStorage.getItem("showSuccessNotification");
    if (savedMessage) {
      setShowSuccess(true);
      localStorage.removeItem("showSuccessNotification");
    }

    const saved = localStorage.getItem("assessment_submission_purwokerto");
    const hasPurwokerto = data.some(item => item.nama === "Tel-U Purwokerto");

    if (saved && !hasPurwokerto) {
      try {
        const purwokertoData = JSON.parse(saved);
        const logo = <FaSchool className="text-blue-600 text-xl" />;
        const newData = [...data];
        const insertIndex = 2;

        newData.splice(insertIndex, 0, {
          id: Date.now(),
          logo,
          nama: "Tel-U Purwokerto",
          skor: purwokertoData.skor || [3, 3, 3, 3],
          hasil: purwokertoData.hasil || 3,
          tanggal: new Date().toLocaleDateString("id-ID"),
          status: "Lulus",
          aksi: "view",
        });

        setData(newData);
      } catch (e) {
        console.error("Gagal parsing data Purwokerto:", e);
      }
    }
  }, []);

  const columns = [
    { header: "No", key: "nomor", width: "50px" },
    { header: "Logo", key: "logo", width: "60px" },
    { header: "Nama UPPS/KC", key: "nama", width: "180px" },
    { header: "Tanggal Submit", key: "tanggal", width: "140px" },
    { header: "Skor 1", key: "skor1", width: "80px" },
    { header: "Skor 2", key: "skor2", width: "80px" },
    { header: "Skor 3", key: "skor3", width: "80px" },
    { header: "Skor 4", key: "skor4", width: "80px" },
    { header: "Hasil", key: "hasil", width: "80px" },
    { header: "Status", key: "status", width: "120px" },
    { header: "Aksi", key: "aksi", width: "80px" },
  ];

  const tableData = data.map((item, index) => ({
    nomor: index + 1,
    logo: item.logo,
    nama: item.nama,
    tanggal: item.tanggal,
    skor1: item.skor[0],
    skor2: item.skor[1],
    skor3: item.skor[2],
    skor4: item.skor[3],
    hasil: item.hasil,
    status: (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
          item.nama === "Tel-U Jakarta"
            ? "bg-blue-500 text-white"
            : item.status === "Lulus"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {item.nama === "Tel-U Jakarta"
          ? "Submitted"
          : item.status === "Lulus"
          ? "Approve"
          : "Belum Selesai"}
      </span>
    ),
    aksi:
      item.aksi === "edit" ? (
        <button className="text-blue-600 hover:text-blue-800 mx-auto block">
          <MdEdit size={20} />
        </button>
      ) : item.aksi === "view" ? (
        <button className="text-gray-600 hover:text-gray-800 mx-auto block">
          <MdRemoveRedEye size={20} />
        </button>
      ) : item.aksi === "progress" ? (
        <div className="text-red-499 mx-auto">
          <IoIosPaperPlane size={20} />
        </div>
      ) : null,
  }));

  return (
    <div
       className="p-3 bg-white rounded-lg shadow-md border border-gray-200 mx-auto w-full max-w-6xl min-h-16 max-h-96 overflow-y-auto"
    >
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Assessment berhasil dikirim!"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Pengisian Assessment
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Berikut adalah daftar UPPS/KC yang sudah melakukan assessment
      </p>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Cari..."
          className="border border-gray-300 rounded px-3 py-2 w-48 text-sm"
        />

        <div className="flex flex-wrap items-center justify-between gap-6 mb-4">

  {/* Tombol Kiri: Copy, Print, Download */}
  <div className="flex flex-wrap gap-2">
    <button className="h-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300 text-sm flex items-center gap-2">
      <BiCopy size={16} />
      Copy
    </button>
    <button className="h-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300 text-sm flex items-center gap-2">
      <BsPrinter size={16} />
      Print
    </button>
    <button className="h-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300 text-sm flex items-center gap-2">
      <HiDownload size={16} />
      Download
    </button>
  </div>

  {/* Tombol Utama: Start Assessment (di kanan) */}
  <Button
    variant="primary"
    className="h-10  text-white text-sm font-semibold px-6 py-2 rounded flex items-center gap-5"
  >
    Start Assessment
  </Button>

</div>
</div>
      <Table
        columns={columns}
        data={tableData}
        currentPage={1}
        rowsPerPage={10}
      />
    </div>
  );
};

export default AssessmentTable;
