'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';
import UniversalDropdown from '@/components/ui/universal-dropdown';
import NotificationBell from '@/components/ui/NotificationBell';
import { User, ChevronDown, Plus, Trash2 } from "lucide-react";

const FormMaturityPage = () => {
  const [form, setForm] = useState({
    level: '',
    namaLevel: '',
    skorMin: '',
    skorMax: '',
    deskripsiUmum: '',
  });

  const [deskripsiList, setDeskripsiList] = useState<string[]>([]);

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

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar onItemClick={(item) => console.log("Clicked:", item)} />

      <div className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-end items-center mb-6 gap-4">
          <NotificationBell />
          <UniversalDropdown
            trigger={
              <div className="flex items-center gap-2 border-2 border-[#2C3E50] rounded-xl px-4 py-2 bg-white text-[#2C3E50]">
                <User size={20} />
                <ChevronDown size={20} />
              </div>
            }
          >
            <UniversalDropdown.Item label="Profil" onClick={() => {}} />
            <UniversalDropdown.Item label="Logout" onClick={() => {}} />
          </UniversalDropdown>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8 max-w-5xl mx-auto">
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

          {/* Deskripsi Umum dan Deskripsi List */}
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

          {/* List Input Deskripsi */}
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

          {/* Tombol Simpan & Batal */}
          <div className="mt-8 flex justify-between">
            <button className="border border-gray-400 text-sm px-6 py-2 rounded-md text-red-500 hover:bg-red-50">
              ✕ Batal
            </button>

            <button
              className="bg-[#E5E7EB] text-gray-500 text-sm px-6 py-2 rounded-md cursor-not-allowed flex items-center gap-2"
              disabled
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="..." />
              </svg>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormMaturityPage;
