"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSchool } from "react-icons/fa";
import { MdRemoveRedEye, MdEdit } from "react-icons/md";
import Table from "@/components/Table";
import { HiDownload } from "react-icons/hi";
import { IoIosPaperPlane } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import SuccessNotification from "@/components/SuccessNotification";
import Button from "@/components/button";
import ModalConfirm from "./StarAssessment/ModalConfirm";
import { MessageCircleWarning } from 'lucide-react';
import {
    Plus, Edit2, Trash2, Eye, Loader2, LogOut, Info, Upload, Copy, ExternalLink, ArrowRight,
    DoorOpen,
    ArrowLeft,
    Printer,
    Search,
    ChevronDown
  } from "lucide-react";

const AssessmentTable = ({ hideStartButton = false }) => {
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
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const savedMessage = localStorage.getItem("showSuccessNotification");
    if (savedMessage) {
      setShowSuccess(true);
      localStorage.removeItem("showSuccessNotification");
    }

    const saved = localStorage.getItem("assessment_submission_purwokerto");
    const hasPurwokerto = data.some(
      (item) => item.nama === "Tel-U Purwokerto"
    );

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

  const handleApprove = () => {
  setData((prevData) => {
    const newData = prevData.map((item) =>
      item.nama === "Tel-U Purwokerto"
        ? { ...item, aksi: "edit", status: "Edit" }
        : item
    );
    console.log("Updated data after approve:", newData); // debug
    return newData;
  });
  setShowModal(false);
  setShowSuccess(true);
};

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
    logo: (
      <div className="flex items-center gap-2 relative group">
        {item.logo}
        {item.nama === "Tel-U Purwokerto" && item.aksi !== "edit" && (
          <div className="relative">
            <MessageCircleWarning
              onClick={() => setShowModal(true)}
              className="text-yellow-500  cursor-pointer"
              size={18}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 
            hidden group-hover:block bg-black text-white text-[15px] rounded-lg 
            px-4 py-2 whitespace-normal w-[220px] shadow-lg z-50 text-center">
            User mengajukan untuk mengubah data. Klik ikon untuk approve.
            {/* Triangle pointer (segitiga hitam) */}
           <div className="absolute left-1/2 bottom-full -translate-x-1/2  w-2 h-2 bg-black rotate-45"></div>
            {/* Garis merah tipis di atas segitiga */}
            <div className="absolute left-1/2 top-[calc(100%+2px)] -translate-x-1/2 w-2 h-1 bg-red-600"></div>
          </div>
          </div>
        )}
      </div>
    ),
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
          item.status === "Edit"
            ? "bg-blue-500 text-white"
            : item.status === "Lulus"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {item.status}
      </span>
    ),
    aksi:
      item.aksi === "edit" ? (
        <button className="text-orange-600 hover:text-blue-800 mx-auto block">
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

  // Fungsi untuk menyalin data tabel ke clipboard
const handleCopy = () => {
  const headers = columns.map(col => col.header).join('\t');
  const rows = tableData.map(row => 
    [
      row.nomor,
      row.nama,
      row.tanggal,
      row.skor1,
      row.skor2,
      row.skor3,
      row.skor4,
      row.hasil,
      row.status.props.children, // karena status adalah JSX
    ].join('\t')
  );
  const content = [headers, ...rows].join('\n');

  navigator.clipboard.writeText(content)
    .then(() => {
      alert('Data berhasil disalin ke clipboard!');
    })
    .catch(err => {
      console.error('Gagal menyalin:', err);
      alert('Gagal menyalin data.');
    });
};

// Fungsi untuk mencetak tabel
const handlePrint = () => {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) {
    alert('Pop-up blocker mungkin menghalangi pencetakan.');
    return;
  }

  const headers = columns.map(col => `<th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">${col.header}</th>`).join('');
  const rows = tableData.map(row => `
    <tr>
      <td>${row.nomor}</td>
      <td>${row.nama}</td>
      <td>${row.tanggal}</td>
      <td>${row.skor1}</td>
      <td>${row.skor2}</td>
      <td>${row.skor3}</td>
      <td>${row.skor4}</td>
      <td>${row.hasil}</td>
      <td>${row.status.props.children}</td>
    </tr>
  `).join('');

  const printContent = `
    <html>
      <head>
        <title>Print Assessment Table</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Pengisian Assessment</h2>
        <table>
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

// Fungsi untuk mengunduh data sebagai file CSV
const handleDownload = () => {
  const headers = columns
    .map(col => col.header)
    .join(',');

  const rows = tableData.map(row => {
    // Ambil teks dari status (karena status adalah JSX)
    const statusText = typeof row.status === 'object' 
      ? row.status.props.children 
      : row.status;

    return [
      row.nomor,
      `"${row.nama}"`, // Gunakan tanda kutip agar aman jika ada koma
      `"${row.tanggal}"`,
      row.skor1,
      row.skor2,
      row.skor3,
      row.skor4,
      row.hasil,
      `"${statusText}"`,
    ].join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM untuk Unicode/UTF-8
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `assessment-data-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="p-3 bg-white rounded-lg shadow-md border border-gray-200 mx-auto w-full max-w-5xl min-h-90 max-h-96 overflow-y-auto relative mt-25">
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Assessment berhasil diubah menjadi status Edit!"
      />

      <ModalConfirm
        isOpen={showModal}
        title="Menyetujui pengajuan edit assessment?"
        header="Konfirmasi"
        message="Menyetujui pengajuan edit assessment?"
        confirmLabel="Approve"
        cancelLabel="Tolak"
        onConfirm={handleApprove}
        onCancel={() => setShowModal(false)}
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Pengisian Assessment
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Berikut adalah daftar UPPS/KC yang sudah melakukan assessment
      </p>

    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    {/* 🔍 Search Bar */}
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white shadow-sm w-80">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder="Cari UPPS/KC..."
        className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
        onChange={(e) => console.log("Search:", e.target.value)}
      />
    </div>

    {/* 🛠️ Action Buttons */}
    <div className="flex items-center gap-3">
      <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy} className="h-10 px-4 py-2 text-sm">
        Copy
      </Button>
      <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint} className="h-10 px-4 py-2 text-sm">
        Print
      </Button>
      <Button variant="outline" icon={ChevronDown} iconPosition="right" onClick={handleDownload} className="h-10 px-4 py-2 text-sm">
        Download
      </Button>

      {/* 🔹 TOMBOL START ASSESSMENT: Hanya muncul jika tidak di-hide */}
        {!hideStartButton && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => router.push("/assessment")}
              className="h-10 px-8 py-2 text-white text-sm font-semibold rounded flex items-center gap-2 transition"
            >
              Start Assessment
            </Button>
          </div>
        )}
    </div>
  </div>
</div>

      <Table
        columns={columns}
        data={tableData}
        currentPage={1}
        rowsPerPage={10}
        // className="w-full"
      />
    </div>
  );
};

export default AssessmentTable;
