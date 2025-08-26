"use client";

import React, { useState } from "react";
import TableUpdate from "@/components/TableUpdate"; // pastikan path benar

export default function TablePage() {
  // data dummy sesuai struktur baru
  const [data, setData] = useState([
    {
      nomor: 1,
      variable: "Kualitas Layanan",
      indikator: "Pelayanan cepat",
      pertanyaan: "Apakah pelayanan cepat?",
      deskripsiSkor0: "Tidak sama sekali",
      deskripsiSkor1: "Kurang cepat",
      deskripsiSkor2: "Cukup cepat",
      deskripsiSkor3: "Cepat",
      deskripsiSkor4: "Sangat cepat",
      tipeSoal: "Pilihan Ganda",
      status: "Active",
    },
    {
      nomor: 2,
      variable: "Fasilitas",
      indikator: "Kenyamanan ruang tunggu",
      pertanyaan: "Apakah ruang tunggu nyaman?",
      deskripsiSkor0: "Sangat tidak nyaman",
      deskripsiSkor1: "Kurang nyaman",
      deskripsiSkor2: "Cukup nyaman",
      deskripsiSkor3: "Nyaman",
      deskripsiSkor4: "Sangat nyaman",
      tipeSoal: "Pilihan Ganda",
      status: "Inactive",
    },
  ]);

  // definisi kolom
  const columns = [
    { header: "Nomor", key: "nomor", width: "60px", className: "text-center" },
    { header: "Nama Variable", key: "variable", width: "180px" },
    { header: "Indikator", key: "indikator", width: "250px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
    { header: "Deskripsi Skor 0", key: "deskripsiSkor0", width: "200px" },
    { header: "Deskripsi Skor 1", key: "deskripsiSkor1", width: "200px" },
    { header: "Deskripsi Skor 2", key: "deskripsiSkor2", width: "200px" },
    { header: "Deskripsi Skor 3", key: "deskripsiSkor3", width: "200px" },
    { header: "Deskripsi Skor 4", key: "deskripsiSkor4", width: "200px" },
    {
      header: "Tipe Soal",
      key: "tipeSoal",
      width: "140px",
      className: "text-center",
    },
    {
      header: "Aksi",
      key: "action",
      width: "200px",
      className:
        "text-center sticky right-0 border border-gray-200 z-10 bg-gray-100",
    },
  ];

  // handler edit
  const handleEdit = (id: number) => {
    alert("Edit item dengan nomor: " + id);
  };

  // handler deactivate
  const handleDeactivate = (index: number) => {
    const newData = [...data];
    newData[index].status = "Inactive";
    setData(newData);
  };

  // handler reactivate
  const handleReactivate = (index: number) => {
    const newData = [...data];
    newData[index].status = "Active";
    setData(newData);
  };

  return (
    <div className="p-6">
      <div className="border rounded-lg overflow-hidden">
        <TableUpdate
          columns={columns}
          data={data}
          currentPage={1}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />
      </div>
    </div>
  );
}
