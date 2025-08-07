'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

type FormMaturityProps = {
  mode: 'add' | 'edit';
  initialData?: {
    level: string;
    namaLevel: string;
    skorMin: string;
    skorMax: string;
    deskripsiUmum: string;
    deskripsiList?: string[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
};

export default function FormMaturity({
  mode,
  initialData,
  onSave,
  onCancel,
}: FormMaturityProps) {
  const [form, setForm] = useState({
    level: '',
    namaLevel: '',
    skorMin: '',
    skorMax: '',
    deskripsiUmum: '',
  });

  const [deskripsiList, setDeskripsiList] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        level: initialData.level,
        namaLevel: initialData.namaLevel,
        skorMin: initialData.skorMin,
        skorMax: initialData.skorMax,
        deskripsiUmum: initialData.deskripsiUmum,
      });
      setDeskripsiList(initialData.deskripsiList || []);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeskripsiChange = (index: number, value: string) => {
    const updated = [...deskripsiList];
    updated[index] = value;
    setDeskripsiList(updated);
  };

  const handleTambahDeskripsi = () => {
    setDeskripsiList([...deskripsiList, '']);
  };

  const handleHapusDeskripsi = (index: number) => {
    const updated = deskripsiList.filter((_, i) => i !== index);
    setDeskripsiList(updated);
  };

  const handleSubmit = () => {
    onSave({ ...form, deskripsiList });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-5xl mx-auto">
      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Level</label>
          <input
            name="level"
            value={form.level}
            onChange={handleChange}
            placeholder="Masukkan Angka Level"
            className="border border-gray-300 text-sm rounded-md w-full px-4 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Nama Level</label>
          <input
            name="namaLevel"
            value={form.namaLevel}
            onChange={handleChange}
            placeholder="Masukkan Nama Level"
            className="border border-gray-300 text-sm rounded-md w-full px-4 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Skor Minimum</label>
          <input
            name="skorMin"
            value={form.skorMin}
            onChange={handleChange}
            placeholder="Masukkan Angka Minimum"
            className="border border-gray-300 text-sm rounded-md w-full px-4 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Skor Maximum</label>
          <input
            name="skorMax"
            value={form.skorMax}
            onChange={handleChange}
            placeholder="Masukkan Angka Maximum"
            className="border border-gray-300 text-sm rounded-md w-full px-4 py-2 mt-1"
          />
        </div>
      </div>

      {/* Deskripsi Umum dan Tambah Deskripsi */}
      <div className="flex gap-6 mt-6">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">Deskripsi Umum</label>
          <textarea
            name="deskripsiUmum"
            value={form.deskripsiUmum}
            onChange={handleChange}
            placeholder="Masukkan Deskripsi"
            className="border border-gray-300 text-sm rounded-md w-full px-4 py-2 mt-1 h-24 bg-[#FAFAFA]"
          />
        </div>

        <div className="flex flex-col justify-end">
          <label className="text-sm font-medium text-gray-700 mb-1">Deskripsi per Variabel</label>
          <button
            onClick={handleTambahDeskripsi}
            className="border border-[#0B3BEC] text-[#0B3BEC] bg-[#F3F6FD] text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#E0ECFF]"
          >
            <Plus className="w-4 h-4" />
            Tambah Deskripsi
          </button>
        </div>
      </div>

      {/* Input List Deskripsi */}
      <div className="mt-4 space-y-3">
        {deskripsiList.map((desc, index) => (
          <div key={index} className="flex items-start gap-2">
            <input
              type="text"
              value={desc}
              onChange={(e) => handleDeskripsiChange(index, e.target.value)}
              className="border border-gray-300 rounded-md w-full px-4 py-2 text-sm"
              placeholder={`Deskripsi variabel ${index + 1}`}
            />
            <button
              onClick={() => handleHapusDeskripsi(index)}
              className="text-red-500 hover:text-red-700 mt-2"
              title="Hapus"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Tombol Batal dan Simpan */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onCancel}
          className="border border-gray-400 text-sm px-6 py-2 rounded-md text-red-500 hover:bg-red-50"
        >
          ✕ Batal
        </button>

        <button
          onClick={handleSubmit}
          className="bg-[#0B3BEC] text-white text-sm px-6 py-2 rounded-md hover:bg-[#0A2FC2]"
        >
          {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
