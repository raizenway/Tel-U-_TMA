// components/AssessmentTable.jsx
"use client";
import { useEffect, useState } from "react";
import { FaSchool } from 'react-icons/fa';
import { MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Table from '@/components/Table'; // Pastikan path benar (misal: @/components/Table)
import { FiSearch } from 'react-icons/fi'; // Untuk ikon pencarian
import { BiCopy } from 'react-icons/bi'; // Untuk ikon copy
import { BsPrinter } from 'react-icons/bs'; // Untuk ikon print
import { HiDownload } from 'react-icons/hi'; // Untuk ikon download
import { IoIosPaperPlane } from 'react-icons/io'; // Untuk ikon start assessment

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

  useEffect(() => {
    const saved = localStorage.getItem("assessment_submission_purwokerto");
    if (saved) {
      try {
        const purwokertoData = JSON.parse(saved);
        const logo = <FaSchool className="text-blue-600 text-xl" />;

        // Sisipkan Tel-U Purwokerto di posisi ketiga (index 2)
        const updatedData = [...data];
        updatedData.splice(2, 0, {
          ...purwokertoData,
          logo,
          skor: purwokertoData.skor || [3, 3, 3, 3],
          hasil: purwokertoData.hasil || 3,
        });

        setData(updatedData);
      } catch (e) {
        console.error("Gagal parsing data Purwokerto:", e);
      }
    }
  }, []);

  // Konfigurasi kolom untuk komponen Table
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

  // Transformasi data agar sesuai dengan format `Table`
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
          item.status === "Lulus"
            ? "bg-green-100 text-green-800"
            : item.status === "Belum Selesai"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {item.status}
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
        <div className="text-red-500 mx-auto">🔴</div>
      ) : null,
  }));

  return (
   <div
      className="p-4 bg-white rounded-lg shadow-md"
      style={{
        position: 'absolute',     // Bisa diganti: 'fixed', 'relative'
        top: '80px',              // Jarak dari atas
        left: '50px',             // Jarak dari kiri
        width: 'calc(100% - 100px)', // Lebar responsif
        maxWidth: '1200px',       // Maksimal lebar
        minHeight: '60px',       // Tinggi minimum
        maxHeight: '80vh',        // Maksimal tinggi (80% dari viewport)
        overflowY: 'auto',        // Scroll jika konten terlalu panjang
        zIndex: 10,               // Di atas elemen lain
        border: '1px solid #e5e7eb', // Opsional: tambah border
      }}
    >
      {/* Judul Halaman */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Pengisian Assessment
      </h2>

      {/* Deskripsi */}
      <p className="text-sm text-gray-600 mb-4">
        Berikut adalah daftar UPPS/KC yang sudah melakukan assessment
      </p>

      {/* Baris Kontrol */}
      <div className="flex items-center justify-between mb-4">
        {/* Search */}
        <div className="flex items-center space-x-2">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Cari..."
            className="border border-gray-300 rounded px-3 py-2 w-48 text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center gap-2">
            <BiCopy className="text-gray-600" />
            Copy
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center gap-2">
            <BsPrinter className="text-gray-600" />
            Print
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center gap-2">
            <HiDownload className="text-gray-600" />
            Download
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2">
            <IoIosPaperPlane className="text-white" />
            Start Assessment
          </button>
        </div>
      </div>

      {/* Gunakan komponen Table generik */}
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