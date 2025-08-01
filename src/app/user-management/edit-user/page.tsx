'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');

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
    role: '',
  });

  useEffect(() => {
    if (!userIdFromQuery) return;

    const storedUser = localStorage.getItem('selectedUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.userId === userIdFromQuery) {
          setForm({
            userId: user.userId || '',
            username: user.username || '',
            password: user.password || '',
            namaUser: user.namaUser || '',
            namaPIC: user.namaPIC || '',
            email: user.email || '',
            nomorHp: user.nomorHp || '',
            status: user.status || '',
            role: user.role || '',
          });
        } else {
          console.warn('User ID di query tidak cocok dengan selectedUser.');
        }
      } catch (err) {
        console.error('Gagal parsing selectedUser:', err);
      }
    } else {
      console.warn('selectedUser tidak ditemukan di localStorage.');
    }
  }, [userIdFromQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nomorHp' && /[^0-9]/.test(value)) return; // hanya angka
    setForm({ ...form, [name]: value });
  };

  const handleCancel = () => {
    router.push('/user-management');
  };

  const handleSave = () => {
    const storedUsers = localStorage.getItem('users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];

    users = users.map((user: any) =>
      user.userId === form.userId ? { ...user, ...form } : user
    );

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('selectedUser'); // bersihkan setelah simpan
    router.push('/user-management');
  };

  const isFormValid =
    form.userId && form.username && form.password && form.namaUser && form.status;

  return (
    <main className="min-h-screen bg-gray-200 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit User - {form.role}</h1>

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
              type="text"
              value={form.userId}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">User Name</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
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
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          {form.role !== 'Non SSO' && (
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
                      {logoFile ? (
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
                      ) : (
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
              className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-200"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nomor Handphone</label>
            <input
              name="nomorHp"
              type="text"
              value={form.nomorHp}
              onChange={handleChange}
              maxLength={15}
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
