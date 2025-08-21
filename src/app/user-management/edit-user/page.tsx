'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Save} from "lucide-react";
import Button  from "@/components/button";

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const pathname = usePathname();

  const [tab, setTab] = useState("welcome");
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
    logoPreview: '', // base64 image
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
            logoPreview: user.logoPreview || '', // foto lama
          });
          setLogoFileName(user.logoFileName || 'Cari Lampiran...');
        }
      } catch (err) {
        console.error('Gagal parsing selectedUser:', err);
      }
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
      user.userId === form.userId
        ? { ...user, ...form, logoFileName, logoPreview: form.logoPreview }
        : user
    );

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('selectedUser');
    router.push('/user-management');
  };

  const isFormValid =
    form.userId && form.username && form.password && form.namaUser && form.status;

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="min-h-screen w-full p-8 mt-20">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-7xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFormValid) handleSave();
            }}
            className="grid grid-cols-2 gap-x-12 gap-y-6"
          >
            <div>
              <label className="block mb-1 text-sm font-medium">User ID</label>
              <input
                name="userId"
                type="text"
                value={form.userId}
                readOnly
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-100"
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
              <label className="block mb-1 text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
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
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setForm((prev) => ({
                              ...prev,
                              logoPreview: base64String,
                            }));
                            setLogoFile(file);
                            setLogoFileName(file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    />
                    <div className="flex items-center justify-between border border-gray-300 rounded-md bg-white-200 px-3 py-2 text-gray-700">
                      <span className="truncate">{logoFileName}</span>
                      <div className="flex items-center gap-2">
                        {(logoFile || form.logoPreview) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setForm((prev) => ({ ...prev, logoPreview: '' }));
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
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
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
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
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white-200"
              >
                <option value="">Pilih Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>

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
                className="rounded-[12px] px-17 py-2 text-sm font-semibold"
              >
                Simpan
              </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
