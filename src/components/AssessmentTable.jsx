"use client";

import { useEffect, useState } from "react";
import { FaSchool } from "react-icons/fa";
import { MdRemoveRedEye, MdEdit } from "react-icons/md";
import Table from "@/components/Table";
import { BiCopy } from "react-icons/bi";
import { BsPrinter } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { IoIosPaperPlane } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
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
  const [showModal, setShowModal] = useState(false);

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
    setData((prevData) =>
      prevData.map((item) =>
        item.nama === "Tel-U Purwokerto"
          ? { ...item, aksi: "edit", status: "Edit" }
          : item
      )
    );
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
            <IoNotifications
              onClick={() => setShowModal(true)}
              className="text-red-500 animate-bounce cursor-pointer"
              size={18}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal shadow-lg z-50">
              User mengajukan untuk mengubah data. Klik ikon untuk approve.
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
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
    <div className="p-3 bg-white rounded-lg shadow-md border border-gray-200 mx-auto w-full max-w-full min-h-67 max-h-96 overflow-y-auto relative">
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Assessment berhasil diubah menjadi status Edit!"
      />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi</h2>
            <p className="mb-6">Menyetujui pengajuan edit assessment?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
              >
                Tolak
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
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

          <Button
            variant="primary"
            className="h-10 text-white text-sm font-semibold px-6 py-2 rounded flex items-center gap-5"
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
        // className="w-full"
      />
    </div>
  );
};

export default AssessmentTable;
