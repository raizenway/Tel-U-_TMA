'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Save } from "lucide-react";
import Button from "@/components/button";
import { useGetUserById, useUpdateUser } from '@/hooks/useUserManagement';
import { BRANCHES } from '@/interfaces/branch';

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const pathname = usePathname();

  const [, setTab] = useState("welcome");

  const [form, setForm] = useState({
    userId: '',
    username: '',
    password: '',
    namaUser: '',
    namaPIC: '',
    email: '',
    nomorHp: '',
    status: '',
    branchId: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFileName, setLogoFileName] = useState<string>('Cari Lampiran...');

  const { data, loading, error } = useGetUserById(Number(userIdFromQuery));
  const { mutate: updateUser, loading: updating } = useUpdateUser();

  // ✅ useEffect hanya untuk load data — TIDAK ADA FUNGSI DI DALAMNYA!
  useEffect(() => {
    if (loading || !data?.data) return;

    const user = data.data;

    setForm({
      userId: user.id.toString(),
      username: user.username,
      password: '',
      namaUser: user.fullname,
      namaPIC: user.picName || '',
      email: user.email,
      nomorHp: String(user.phoneNumber) || '',
      status: user.status,
      branchId: user.branchId != null ? user.branchId.toString() : '', 
    });

    if (user.logoFile && user.logoFile.path) {
    // ✅ Gunakan full URL dengan API_URL
    const logoUrl = `${process.env.NEXT_PUBLIC_API_URL}/${user.logoFile.path}`;
    setLogoPreview(logoUrl);
    setLogoFileName(user.logoFile.originalName || 'Logo saat ini');
    } else {
      setLogoPreview('');
      setLogoFileName('Cari Lampiran...');
    }
  }, [data, loading]);

  // ✅ SEMUA FUNGSI DI LUAR useEffect
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    const { name, value } = e.target;

    if (name === 'nomorHp') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 13) {
        setForm({ ...form, [name]: numericValue });
      }
      return;
    } else if (name === 'username') {
      const noSpaceValue = value.replace(/\s/g, '');
      setForm({ ...form, [name]: noSpaceValue });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoFileName('Cari Lampiran...');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoFileName(file.name);
  };

  const handleCancel = () => {
    setLogoFile(null);
    setLogoPreview('');
    setLogoFileName('Cari Lampiran...');
    router.push('/user-management');
  };

  const handleSave = async () => {
    setErrorMessage(null);

    if (!form.userId || !form.username || !form.namaUser || !form.status) {
      setErrorMessage('Mohon lengkapi field wajib: User ID, Username, Nama User, Status');
      return;
    }

    if (form.username.includes(' ')) {
      setErrorMessage('Username tidak boleh mengandung spasi.');
      return;
    }

    if (form.nomorHp.length < 10 || form.nomorHp.length > 13) {
      setErrorMessage('Nomor Handphone harus terdiri dari 10 hingga 13 digit.');
      return;
    }

    if (!isValidEmail(form.email)) {
      setErrorMessage('Email tidak valid. Contoh: nama@domain.com');
      return;
    }

    const requestBody = {
      fullname: form.namaUser,
      username: form.username,
      email: form.email,
      phoneNumber: form.nomorHp,
      roleId: data.data.roleId,
      status: form.status as 'active' | 'inactive',
      picName: form.namaPIC,
      ...(logoFile && { logo: logoFile }),
      ...(data?.data?.roleId === 2 && { branchId: Number(form.branchId) }),
    };

    if (form.password) {
      (requestBody as any).password = form.password;
    }

    try {
      await updateUser(Number(form.userId), requestBody);
      localStorage.setItem('editDataSuccess', 'true');
      router.push('/user-management');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui user. Silakan coba lagi.');
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid =
    form.userId &&
    form.username &&
    !form.username.includes(' ') &&
    form.namaUser &&
    isValidEmail(form.email) &&
    form.status &&
    (data?.data?.roleId === 2 ? form.branchId !== '' : true) && 
    form.nomorHp.length >= 10 &&
    form.nomorHp.length <= 13;

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <main className="min-h-screen w-full p-8 ">
          <div className="bg-white rounded-lg p-8 shadow-sm max-w-7xl w-full mx-auto text-center">
            <p>Loading data user...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <main className="min-h-screen w-full p-8 ">
          <div className="bg-white rounded-lg p-8 shadow-sm max-w-7xl w-full mx-auto text-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main>
        <div className="bg-white rounded-lg p-8 max-w-7xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFormValid) handleSave();
            }}
            className="grid grid-cols-2 gap-x-12 gap-y-6"
          >
            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">User Name</label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Nama User</label>
              <input
                name="namaUser"
                type="text"
                value={form.namaUser}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            {data.data?.roleId === 2 && (
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
                        {(logoFileName !== 'Cari Lampiran...' || logoFile) && (
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              >
                <option value="">Pilih Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Nomor Handphone</label>
              <input
                name="nomorHp"
                type="text"
                value={form.nomorHp}
                onChange={handleChange}
                maxLength={15}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            {data?.data?.roleId === 2 && (
            <div>
              <label className="block mb-1 text-sm font-medium">Kampus Cabang</label>
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
                required
              >
                <option value="">Pilih Kampus Cabang</option>
                {BRANCHES.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">
                <span className="font-bold">Peringatan:</span> {errorMessage}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-8 gap-6">
            <Button
              variant="ghost"
              icon={X}
              iconColor="text-red-600"
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
              onClick={handleSave}
              disabled={!isFormValid || updating || !!errorMessage}
              className="rounded-[12px] px-17 py-2 text-sm font-semibold"
            >
              {updating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}