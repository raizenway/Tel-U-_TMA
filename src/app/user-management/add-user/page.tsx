'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X, Save} from "lucide-react";
import Button  from "@/components/button";

export default function AddUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';

  const [logoFileName, setLogoFileName] = useState('Cari Lampiran...');
  const [logoPreview, setLogoPreview] = useState<string>(''); // base64 image
  const pathname = usePathname();
  const [tab, setTab] = useState("welcome");

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
    const { name, value } = e.target;
    if (name === 'userId' || name === 'nomorHp') {
      const numericValue = value.replace(/\D/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCancel = () => {
    router.push('/user-management');
  };

  const isFormValid =
    form.userId.trim() !== '' &&
    form.username.trim() !== '' &&
    form.password.trim() !== '' &&
    form.namaUser.trim() !== '' &&
    form.status.trim() !== '' &&
    form.email.trim() !== '' &&
    form.nomorHp.trim() !== '';

  const handleSave = () => {
    if (!isFormValid) return;

    const newUser = {
      userId: form.userId,
      username: form.username,
      password: form.password,
      namaUser: form.namaUser,
      role: role,
      status: form.status.toLowerCase(),
      namaPIC: form.namaPIC,
      email: form.email,
      nomorHp: form.nomorHp,
      logoFileName: role !== 'Non SSO' && logoPreview ? logoFileName : '',
      logoPreview: role !== 'Non SSO' && logoPreview ? logoPreview : '',
    };

    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('newDataAdded', 'true');
    router.push('/user-management');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string); // base64
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="min-h-screen w-full p-8 mt-20">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFormValid) handleSave();
            }}
            className="grid grid-cols-2 gap-4"
          >
            {/* User ID */}
            <div>
              <label className="block mb-1 text-sm font-medium">User ID</label>
              <input
                name="userId"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.userId}
                onChange={handleChange}
                placeholder="Masukkan User ID "
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* User Name */}
            <div>
              <label className="block mb-1 text-sm font-medium">User Name</label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan Username"
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan Password"
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* Nama User */}
            <div>
              <label className="block mb-1 text-sm font-medium">Nama User</label>
              <input
                name="namaUser"
                type="text"
                value={form.namaUser}
                onChange={handleChange}
                placeholder="Masukkan Nama User"
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* Logo & Nama PIC */}
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
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    />
                    <div className="flex items-center justify-between border border-gray-300 rounded-md bg-gray-100 px-3 py-2 text-gray-700">
                      <span className="truncate">{logoFileName}</span>
                      <div className="flex items-center gap-2">
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview('');
                              setLogoFileName('Cari Lampiran...');
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-red-500 text-red-500 hover:bg-red-100"
                          >
                            ✕
                          </button>
                        )}
                        {!logoPreview && (
                          <span className="text-sm font-semibold text-gray-400">Upload</span>
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan Alamat Email"
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block mb-1 text-sm font-medium">Nomor Handphone</label>
              <input
                name="nomorHp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                value={form.nomorHp}
                onChange={handleChange}
                placeholder="Masukkan Nomor Handphone "
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
              >
                <option value="">Pilih Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>

          {/* Tombol */}
          <div className="flex justify-end mt-6 gap-4">
          <Button
            variant="ghost"
            icon={() => <X size={18} className="text-red-600" />}
            iconPosition="left"
            onClick={handleCancel}
            className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
          >
            Batal
          </Button>

            <Button
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={isFormValid ? handleSave : undefined}
              className={`px-4 py-2 rounded-md text-white 
                ${isFormValid ? 'bg-[#263859] text-white px-12' : 'bg-gray-400 cursor-not-allowed px-12'}`}
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
