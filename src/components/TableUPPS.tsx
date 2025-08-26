"use client";
import { Pencil, Trash } from "lucide-react";

// Fungsi pembungkus teks setiap 4 kata
function wrapTextEveryFourWords(text: string) {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += 4) {
    chunks.push(words.slice(i, i + 4).join(" "));
  }
  return chunks.join("\n");
}

export default function TableUPPS() {
  const data = [
    {
      nomor: 1,
      logo: "🟢",
      nama: "Telkom Universitas Kampus Jakarta Selatan",
      tanggal: "2025 07 01 Lokasi Jakarta Selatan",
      v1: "80",
      v2: "85",
      v3: "78",
      v4: "90",
      hasil: "Sangat baik dalam pelaksanaan penilaian mutu internal",
      status: "Menunggu persetujuan dari pihak pimpinan",
    },
    {
      nomor: 2,
      logo: "🔵",
      nama: "Telkom Universitas Kampus Surabaya Timur",
      tanggal: "2025 07 15 Lokasi Surabaya Timur",
      v1: "70",
      v2: "65",
      v3: "72",
      v4: "68",
      hasil: "Perlu peningkatan pada aspek sarana prasarana dan SDM",
      status: "Butuh revisi sesuai masukan dari asesor",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto">
      {/* Header Table */}
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
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border px-2 py-1 w-10 text-center">Nomor</th>
              <th className="border px-2 py-1">Logo UPPS/KC</th>
              <th className="border px-2 py-1">Nama UPPS/KC</th>
              <th className="border px-2 py-1">Tanggal Submit</th>
              <th className="border px-2 py-1">Skor V1</th>
              <th className="border px-2 py-1">Skor V2</th>
              <th className="border px-2 py-1">Skor V3</th>
              <th className="border px-2 py-1">Skor V4</th>
              <th className="border px-2 py-1">Hasil</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1 sticky right-0 bg-white z-10">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.nomor} className="border-t">
                <td className="border px-2 py-2 text-center">{row.nomor}</td>
                <td className="border px-2 py-2 text-center">{row.logo}</td>
                <td className="border px-2 py-2 whitespace-pre-line break-words w-48">
                  {wrapTextEveryFourWords(row.nama)}
                </td>
                <td className="border px-2 py-2 whitespace-pre-line break-words w-48">
                  {wrapTextEveryFourWords(row.tanggal)}
                </td>
                <td className="border px-2 py-2">{row.v1}</td>
                <td className="border px-2 py-2">{row.v2}</td>
                <td className="border px-2 py-2">{row.v3}</td>
                <td className="border px-2 py-2">{row.v4}</td>
                <td className="border px-2 py-2 whitespace-pre-line break-words w-52">
                  {wrapTextEveryFourWords(row.hasil)}
                </td>
                <td className="border px-2 py-2 whitespace-pre-line break-words w-52">
                  {wrapTextEveryFourWords(row.status)}
                </td>
                <td className="border px-2 py-2 sticky right-0 bg-white z-10">
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Pencil size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
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