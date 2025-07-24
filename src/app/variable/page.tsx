"use client";

import { useState } from "react";

interface VariableItem {
  id: number;
  variable: string;
  bobot: number;
  deskripsi: string;
  referensi: string;
}

export default function VariablePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const dataPerPage = 10;

  // Data dummy kosong dulu (nanti diisi user di halaman lain)
  const [data, setData] = useState<VariableItem[]>([]);

  const totalPage = Math.max(1, Math.ceil(data.length / dataPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPage) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const indexOfLast = currentPage * dataPerPage;
  const indexOfFirst = indexOfLast - dataPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-8">
      
      <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Cari"
            className="border px-3 py-1 rounded w-1/4"
          />
          <div className="flex gap-2">
            <button className="bg-gray-200 px-3 py-1 rounded">Copy</button>
            <button className="bg-gray-200 px-3 py-1 rounded">Print</button>
            <button className="bg-gray-200 px-3 py-1 rounded">Download</button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Tambah Variabel
            </button>
          </div>
        </div>

        <table className="w-full text-sm border">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="border px-2 py-1 w-10 text-center">No</th>
              <th className="border px-2 py-1">Nama Variabel</th>
              <th className="border px-2 py-1">Bobot</th>
              <th className="border px-2 py-1">Deskripsi</th>
              <th className="border px-2 py-1">Referensi</th>
              <th className="border px-2 py-1 sticky right-0 bg-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data yang tersedia.
                </td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1 text-center">
                    {(currentPage - 1) * dataPerPage + index + 1}
                  </td>
                  <td className="border px-2 py-1">{item.variable}</td>
                  <td className="border px-2 py-1">{item.bobot}</td>
                  <td className="border px-2 py-1">{item.deskripsi}</td>
                  <td className="border px-2 py-1">{item.referensi}</td>
                  <td className="border px-2 py-1 sticky right-0 bg-white flex gap-2">
                    <button className="text-blue-500 hover:underline">✏ Edit</button>
                    <button className="text-green-500 hover:underline">Reactive</button>
                    <button className="text-red-500 hover:underline">Deactivate</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            <select className="border px-2 py-1 rounded">
              <option>10 Data</option>
              <option>20 Data</option>
              <option>50 Data</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className={`bg-gray-200 px-2 py-1 rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPage }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageClick(i + 1)}
                className={`px-2 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              className={`bg-gray-200 px-2 py-1 rounded ${
                currentPage === totalPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPage === totalPage}
            >
              {">"}
            </button>
          </div>
          <div>Total {data.length}</div>
        </div>
      </div>
    </div>
  );
}
