'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X, Save} from "lucide-react";
import Button  from "@/components/button";
import { useCreateUser } from '@/hooks/useUserManagement';
import { CreateUserRequest } from '@/interfaces/user-management';
import { BRANCHES } from '@/interfaces/branch';

export default function AddUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';

  const [logoFileName, setLogoFileName] = useState('Cari Lampiran...');
  const [logoPreview, setLogoPreview] = useState<string>(''); // base64 image
  const pathname = usePathname();
  const [, setTab] = useState("welcome");

  const [form, setForm] = useState({
    username: '',
    password: '',
    namaUser: '',
    namaPIC: '',
    email: '',
    nomorHp: '',
    status: '' as 'active' | 'inactive' | '',
    branchId: '' as string,
  }); 

  const [picName, setPicName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  
  // ✅ Gunakan hook untuk create user
const { mutate: createUser, loading} = useCreateUser();


const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  // ✅ Reset error saat user ketik
  if (errorMessage) {
    setErrorMessage(null);
  }

  const { name, value } = e.target;

  if (name === 'nomorHp') {
  const numericValue = value.replace(/\D/g, '');
  // ✅ Batasi maksimal 13 digit
  if (numericValue.length <= 13) {
    setForm({ ...form, [name]: numericValue });
  }

  } else if (name === 'status') {
    // Hanya terima 'active' atau 'inactive'
    if (value === 'active' || value === 'inactive' || value === '') {
      setForm({ ...form, [name]: value });
    }
    
  } else if (name === 'username') {
    // ✅ Hapus semua spasi dari username saat diketik
    const noSpaceValue = value.replace(/\s/g, '');
    setForm({ ...form, [name]: noSpaceValue });

  } else if (name === 'namaPIC') {
    setPicName(value); // 👈 Tambahkan ini 

  } else {
    setForm({ ...form, [name]: value });
  }
};

  const handleCancel = () => {
    router.push('/user-management');
  };
  
// ✅ Fungsi validasi email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

 const isFormValid =
  form.username.trim() !== '' &&
  form.password.trim() !== '' &&
  form.namaUser.trim() !== '' &&
  isValidEmail(form.email) && // ✅ Ganti cek kosong → cek format valid
  form.nomorHp.length >= 10 &&
  form.nomorHp.length <= 13 &&
  form.status.trim() !== '' &&
  form.branchId !== ''; 
  (role !== 'UPPS/KC' || (document.querySelector('#logo') as HTMLInputElement)?.files?.[0]);

const handleSave = async () => {
  if (!isFormValid) return;

  // Validasi: pastikan status valid
  if (form.status !== 'active' && form.status !== 'inactive') {
    alert('Status harus dipilih: Active atau Inactive');
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
    alert('Email tidak valid. Contoh: user@gmail.com');
    return;
  }
   
  // Validasi hanya untuk PIC
  if (role !== 'Non SSO' && !picName.trim()) {
    alert('Nama PIC wajib diisi');
    return;
  }

  // ✅ VALIDASI: Jika UPPS/KC, wajib upload logo
  if (role === 'UPPS/KC' && !(document.querySelector('#logo') as HTMLInputElement)?.files?.[0]) {
    alert('Logo UPPS/KC wajib diupload.');
    return;
  }

  // Siapkan data yang akan dikirim ke API
const body: CreateUserRequest = {
  username: form.username,
  password: form.password,
  fullname: form.namaUser,
  roleId: role === 'UPPS/KC' ? 2 : 4, // ✅ Ubah string → number
  email: form.email,
  phoneNumber: form.nomorHp,
  branchId: Number(form.branchId), // ✅ Konversi string → number
  status: form.status,
  picName: picName,            // 👈 Tambahkan ini
  ...(logoPreview && { logo: (document.querySelector('#logo') as HTMLInputElement)?.files?.[0] as File }),
  //logo_file_id: logoFileId, // 👈 Tambahkan ini
};
 try {
    await createUser(body);
    localStorage.setItem('newDataAdded', 'true');
    router.push('/user-management');
  } catch (err: any) {
    setErrorMessage(err.message || 'Gagal membuat user. Silakan coba lagi.');
  }
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLogoFileName(file.name);

  // ✅ Simpan file di state, jangan upload sekarang
  // Kita akan kirim bersamaan dengan data user nanti
  setLogoPreview(URL.createObjectURL(file)); // preview base64
};

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);
   


  return (
    <div>
      <div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isFormValid) handleSave();
            }}
            className="grid grid-cols-2 gap-4"
          >
            
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
                    value={picName}           // 👈 Ganti dari form.namaPIC → picName
                    onChange={handleChange}
                    placeholder="Masukkan Nama PIC"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
                  />
                </div>
              </>
            )}
               
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
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
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
            
            {/* Kampus Cabang */}
            <div>
              <label className="block mb-1 text-sm font-medium">Kampus Cabang</label>
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100"
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

          {/* ❗️ Tambahkan ini: Peringatan inline */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-medium">
                  <span className="font-bold">Peringatan:</span> {errorMessage}
                </p>
              </div>
            )}

          {/* Tombol */}
          <div className="flex justify-end mt-6 gap-4">
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
            onClick={isFormValid && !loading && !errorMessage ? handleSave : undefined}
            disabled={!isFormValid || loading || !!errorMessage}
            className={`px-4 py-2 rounded-md text-white 
              ${isFormValid && !loading 
                ? 'bg-[#263859] text-white px-12' 
                : 'bg-gray-400 cursor-not-allowed px-12'}`}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
