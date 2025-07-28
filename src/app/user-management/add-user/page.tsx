'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AddUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';

  const [form, setForm] = useState({
    userId: '',
    userName: '',
    password: '',
    namaUser: '',
    namaPIC: '',
    email: '',
    nomorHp: '',
    status: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    router.push('/user-management');
  };

  const handleSave = () => {
    alert('Data berhasil disimpan (nanti hubungkan ke database/API)');
  };

  const isFormValid = Object.values(form).every((val) => val.trim() !== '');

  return (
    <main className="min-h-screen bg-gray-200 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah User - {role}</h1>

      <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isFormValid) handleSave();
          }}
          className="grid grid-cols-2 gap-4"
        >
          {/* --- semua input tetap seperti sebelumnya --- */}
          <div>
            <label className="block mb-1 text-sm font-medium">User ID</label>
            <input
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="Masukkan User ID"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">User Name</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Masukkan User Name"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nama User</label>
            <input
              name="namaUser"
              value={form.namaUser}
              onChange={handleChange}
              placeholder="Masukkan Nama User"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Logo UPPS/KC</label>
            <input type="file" className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nama PIC</label>
            <input
              name="namaPIC"
              value={form.namaPIC}
              onChange={handleChange}
              placeholder="Masukkan Nama PIC"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan Alamat Email"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nomor Handphone</label>
            <input
              name="nomorHp"
              value={form.nomorHp}
              onChange={handleChange}
              placeholder="Masukkan Nomor Handphone"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            >
              <option value="">Pilih Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>

        {/* Tombol Aksi */}
        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            ❌ Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-md text-white 
              ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            💾 Simpan
          </button>
        </div>
      </div>
    </main>
  );
}
