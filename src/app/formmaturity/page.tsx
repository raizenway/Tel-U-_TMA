'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';
import UniversalDropdown from '@/components/ui/universal-dropdown';
import NotificationBell from '@/components/ui/NotificationBell';
import { User, ChevronDown } from "lucide-react";


const FormMaturityPage = () => {
  const [form, setForm] = useState({
    level: '',
    namaLevel: '',
    skorMin: '',
    skorMax: '',
    deskripsiUmum: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <Sidebar onItemClick={(item) => console.log("Clicked:", item)} />

      {/* Main Content */}
       <div className="px-6 pt-6">
          <div className="flex justify-end p-4 gap-4">
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
         <div className="bg-white rounded-lg shadow-md p-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Level</label>
              <input
                name="level"
                value={form.level}
                onChange={handleChange}
                placeholder="Masukkan Angka Level"
                className="border p-2 rounded w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nama Level</label>
              <input
                name="namaLevel"
                value={form.namaLevel}
                onChange={handleChange}
                placeholder="Masukkan Nama Level"
                className="border p-2 rounded w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skor Minimum</label>
              <input
                name="skorMin"
                value={form.skorMin}
                onChange={handleChange}
                placeholder="Masukkan Angka Minimum"
                className="border p-2 rounded w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skor Maximum</label>
              <input
                name="skorMax"
                value={form.skorMax}
                onChange={handleChange}
                placeholder="Masukkan Angka Maximum"
                className="border p-2 rounded w-full mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Deskripsi Umum</label>
            <textarea
              name="deskripsiUmum"
              value={form.deskripsiUmum}
              onChange={handleChange}
              placeholder="Masukkan Deskripsi"
              className="border p-2 rounded w-full mt-1 h-24"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Deskripsi per Variabel</label>
            <button className="ml-4 text-white bg-[#0B3BEC] px-4 py-2 rounded hover:bg-blue-700 text-sm">
              + Tambah Deskripsi
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50">
              ✕ Batal
            </button>
            <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
              Simpan
            </button>
          </div>
         </div>
      </div>
    </div>
  );
};

export default FormMaturityPage;
