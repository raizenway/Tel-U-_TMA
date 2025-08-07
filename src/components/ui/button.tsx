'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const dummyData = [
  {
    level: 1,
    name: 'Very Low Maturity',
    minScore: '0%',
    maxScore: '24,9%',
    description: 'Sangat belum siap otonomi dan perlu ada perubahan signifikan segera',
  },
  {
    level: 2,
    name: 'Low Maturity',
    minScore: '25%',
    maxScore: '49,9%',
    description: 'Belum siap otonomi dan ada yang harus ditingkatkan segera',
  },
  {
    level: 3,
    name: 'Medium Maturity',
    minScore: '50%',
    maxScore: '74,9%',
    description: 'Sudah siap otonomi level 2, dan masih ada yang perlu ditingkatkan',
  },
];

export default function MaturityLevelPage() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const handleTambah = () => {
    setData(dummyData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <input
            placeholder="Cari"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 border rounded w-full text-sm focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100">Copy</button>
          <button className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100">Print</button>
          <button className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100">Download</button>
          <button
            onClick={handleTambah}
            className="bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244] text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Maturity
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Nama Level</th>
                  <th className="px-4 py-3">Skor Minimum</th>
                  <th className="px-4 py-3">Skor Maximum</th>
                  <th className="px-4 py-3">Deskripsi Umum</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.level}</td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.minScore}</td>
                      <td className="px-4 py-2">{item.maxScore}</td>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 flex items-center gap-2 text-sm text-blue-600">
                        <button className="flex items-center hover:underline">
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button className="flex items-center text-red-600 hover:underline">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <select className="border px-3 py-1 rounded text-sm">
                <option>10 Data</option>
                <option>25 Data</option>
                <option>50 Data</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ChevronLeft className="w-4 h-4" />
              <span className="px-2 py-1 border rounded">1</span>
              <ChevronRight className="w-4 h-4" />
              <span className="ml-2">Total {data.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
