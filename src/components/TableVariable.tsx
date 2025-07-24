"use client";
import { useState } from "react";
import { Pencil, Power, RefreshCw, XCircle } from "lucide-react";

interface Variabel {
  id: number;
  nama: string;
  bobot: number;
  deskripsi: string;
  referensi: string;
  status: "Ready" | "Dead" | "Reactive";
}

export default function TableVariable() {
  const [data, setData] = useState<Variabel[]>([]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
      <h1 className="text-lg font-bold mb-4">TRANSFORMATION MATURITY ASSESSMENT DASHBOARD</h1>

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
          <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            Tambah Variabel
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-2 py-1 text-center sticky left-0 bg-white z-10 w-10">No</th>
              <th className="border px-2 py-1">Nama Variabel</th>
              <th className="border px-2 py-1">Bobot</th>
              <th className="border px-2 py-1">Deskripsi</th>
              <th className="border px-2 py-1">Referensi</th>
              <th className="border px-2 py-1 text-center sticky right-0 bg-white z-10 w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data yang tersedia.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1 text-center sticky left-0 bg-white">{index + 1}</td>
                  <td className="border px-2 py-1">{item.nama}</td>
                  <td className="border px-2 py-1">{item.bobot}</td>
                  <td className="border px-2 py-1">{item.deskripsi}</td>
                  <td className="border px-2 py-1">{item.referensi}</td>
                  <td className="border px-2 py-1 sticky right-0 bg-white">
                    <div className="flex gap-1 justify-center items-center text-xs">
                      <Pencil size={14} className="text-blue-500 cursor-pointer" />
                      {item.status === "Dead" && (
                        <>
                          <XCircle size={14} className="text-red-500 cursor-pointer" />
                          <span className="text-red-500">Dead</span>
                        </>
                      )}
                      {item.status === "Ready" && (
                        <>
                          <Power size={14} className="text-green-500 cursor-pointer" />
                          <span className="text-green-500">Ready</span>
                        </>
                      )}
                      {item.status === "Reactive" && (
                        <>
                          <RefreshCw size={14} className="text-green-500 cursor-pointer" />
                          <span className="text-green-500">Reactive</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          <select className="border px-2 py-1 rounded">
            <option>10 Data</option>
            <option>20 Data</option>
            <option>50 Data</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-200 px-2 py-1 rounded opacity-50 cursor-not-allowed">
            {"<"}
          </button>
          <button className="bg-blue-500 text-white px-2 py-1 rounded">1</button>
          <button className="bg-gray-200 px-2 py-1 rounded opacity-50 cursor-not-allowed">
            {">"}
          </button>
        </div>
        <div>Total {data.length}</div>
      </div>
    </div>
  );
}
