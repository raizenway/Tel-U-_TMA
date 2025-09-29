'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Save} from "lucide-react";
import Button  from "@/components/button";
import { useGetUserById, useUpdateUser } from '@/hooks/useUserManagement';
import { BRANCHES } from '@/interfaces/branch'; 


export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const pathname = usePathname();

  const [, setTab] = useState("welcome");
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
    branchId: '',
    logoPreview: '', // base64 image
  });

const { data, loading, error } = useGetUserById(Number(userIdFromQuery));

const { mutate: updateUser, loading: updating } = useUpdateUser();


useEffect(() => {
  if (loading || !data?.data) return;

  const user = data.data;

  // Mapping roleId ke role string
  const role = user.roleId === 2 ? 'UPPS/KC' : 'Non SSO';

  setForm({
    userId: user.id.toString(),
    username: user.username,
    password: '', // biarkan kosong, artinya "jangan ubah password"
    namaUser: user.fullname,
    namaPIC: user.pic || '',
    email: user.email,
    nomorHp: String(user.phoneNumber) || '',
    status: user.status,
    role,
    branchId: user.branchId.toString(),
    logoPreview: user.logo_file_id ? `/api/logo/${user.logo_file_id}` : '',
  });

  if (user.logo_file_id) {
    setLogoFileName(`Logo_${user.id}.png`);
  }
}, [data, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === 'nomorHp') {
  const numericValue = value.replace(/\D/g, ''); // Hapus non-digit
  if (numericValue.length <= 13) { // ✅ Batasi maks 13 digit
    setForm({ ...form, [name]: numericValue });
  }
  return;

  }  else if (name === 'username') {
    // ✅ Hapus semua spasi dari username saat diketik
    const noSpaceValue = value.replace(/\s/g, '');
    setForm({ ...form, [name]: noSpaceValue });
    return;
  }
  // Untuk semua input lain
  setForm({ ...form, [name]: value });
};

  const handleCancel = () => {
    router.push('/user-management');
  };

const handleSave = async () => {
  if (!form.userId || !form.username || !form.namaUser || !form.status) {
    alert('Mohon lengkapi field wajib: User ID, Username, Nama User, Status');
    return;
  }

    // ✅ Validasi: username tidak boleh mengandung spasi
  if (form.username.includes(' ')) {
    alert('Username tidak boleh mengandung spasi.');
    return;
  }

    // ✅ Validasi: nomor HP harus 10-13 digit
  if (form.nomorHp.length < 10 || form.nomorHp.length > 13) {
    alert('Nomor Handphone harus terdiri dari 10 hingga 13 digit.');
    return;
  }

    // ✅ Validasi: email harus valid
  if (!isValidEmail(form.email)) {
    alert('Email tidak valid. Contoh: nama@domain.com');
    return;
  }

  const requestBody = {
    fullname: form.namaUser,
    username: form.username,
    email: form.email,
    phoneNumber: form.nomorHp,
    roleId: form.role === 'UPPS/KC' ? 2 : 4,
    branchId: Number(form.branchId),
    status: form.status as 'active' | 'inactive',
  };

   if (form.password) {
    (requestBody as any).password = form.password; // hanya tambahkan jika ada
  }

  try {
  await updateUser(Number(form.userId), requestBody);

  // ✅ SIMPAN FLAG UNTUK NOTIFIKASI
  localStorage.setItem('editDataSuccess', 'true');

  // ✅ REDIRECT
  router.push('/user-management');
} catch (err) {
  alert('Gagal memperbarui user. Coba lagi.');
}
};

// ✅ Fungsi validasi email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

  const isFormValid =
  form.userId &&
  form.username &&
  !form.username.includes(' ') &&
  form.namaUser &&
  isValidEmail(form.email) && // ✅ email harus valid
  form.status &&
  form.branchId !== '' && 
  form.nomorHp.length >= 10 &&
  form.nomorHp.length <= 13;

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);

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
                disabled={updating} // ⬅️ tambah ini
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
