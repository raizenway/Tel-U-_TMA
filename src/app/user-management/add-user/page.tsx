'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';

export default function AddUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState('Cari Lampiran...');

  const [form, setForm] = useState({
    userId: '',
    username: '',
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
    const newUser = {
      userId: form.userId,
      username: form.username,
      password: form.password,
      namaUser: form.namaUser,
      role: role,
      status: form.status.toLowerCase(),
    };

    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    router.push('/user-management');
  };

  const isFormValid = form.userId.trim() !== '' &&
    form.username.trim() !== '' &&
    form.password.trim() !== '' &&
    form.namaUser.trim() !== '' &&
    form.status.trim() !== '';

  const navItems = [
    { name: 'Welcome', value: 'welcome' },
    { name: 'Dashboard', value: 'dashboard' },
    { name: 'Assessment', value: 'assessment' },
    { name: 'User Manual', value: 'manual' },
    { name: 'Kelola User', value: 'user' },
    {
      name: 'Logout',
      action: () => {
        alert('Logout clicked');
      },
    },
  ];

  const handleSidebarClick = (tab: string) => {
  router.push(`/${tab}`);
};


  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <Sidebar navItems={navItems} setTab={handleSidebarClick} />

      <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isFormValid) handleSave();
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block mb-1 text-sm font-medium">User ID</label>
            <input
              name="userId"
              type="string"
              value={form.userId}
              onChange={handleChange}
              placeholder="Masukkan User ID"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">User Name</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan Username"
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
              type="text"
              value={form.namaUser}
              onChange={handleChange}
              placeholder="Masukkan Nama User"
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          {/* Hanya tampil jika bukan non-sso */}
          {role !== 'Non SSO' && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium">Logo UPPS/KC</label>
                <div className="relative w-full">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoFileName(file.name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  />
                  <div className="flex items-center justify-between border border-gray-300 rounded-md bg-gray-200 px-3 py-2 text-gray-700">
                    <span className="truncate">{logoFileName}</span>
                    <div className="flex items-center gap-2">
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => {
                        setLogoFile(null);
                        setLogoFileName('Cari Lampiran...');
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-red-100"
                     >
                     ✕
                     </button>
                    )}

                    {!logoFile && (
                      <span className="text-sm font-semibold text-gray-600">Upload</span>
                    )}
</div>

                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Nama PIC</label>
                <input
                  name="namaPIC"
                  type="text"
                  value={form.namaPIC}
                  onChange={handleChange}
                  placeholder="Masukkan Nama PIC"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
                />
              </div>
            </>
          )}

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
              type="numeric" maxLength={15}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

        {/* FORM SECTION */}
        <main className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Tambah User - {role}</h1>

          <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isFormValid) handleSave();
              }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Semua inputan tetap seperti sebelumnya */}
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
                className={`px-4 py-2 rounded-md text-white ${
                  isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                💾 Simpan
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
