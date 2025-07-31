'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  userId: string;
  username: string;
  password: string;
  namaUser: string;
  role: string;
  status?: 'active' | 'inactive';
  logo?: string;
  namaPIC?: string;
}

export default function UserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const editParam = searchParams.get('edit');
  const isEdit = !!editParam;

  const initialData: User = isEdit
    ? JSON.parse(decodeURIComponent(editParam || ''))
    : {
        userId: '',
        username: '',
        password: '',
        namaUser: '',
        role: role || '',
        status: 'active',
        logo: '',
        namaPIC: '',
      };

  const [formData, setFormData] = useState<User>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'userId' || name === 'username' || name === 'namaUser') {
      if (/\D/.test(value) && name === 'userId') return; // only number for userId
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const stored = JSON.parse(localStorage.getItem('users') || '[]');
    const updated = isEdit
      ? stored.map((u: User) => (u.userId === formData.userId ? formData : u))
      : [...stored, formData];

    localStorage.setItem('users', JSON.stringify(updated));
    router.push('/user-management');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit' : 'Tambah'} User</h2>

      <input
        name="userId"
        placeholder="User ID"
        value={formData.userId}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />

      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />

      <input
        name="namaUser"
        placeholder="Nama User"
        value={formData.namaUser}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />

      {formData.role !== 'Non SSO' && (
        <>
          <input
            name="logo"
            placeholder="Logo UPPS/KC"
            value={formData.logo}
            onChange={handleChange}
            className="border p-2 mb-2 w-full"
          />
          <input
            name="namaPIC"
            placeholder="Nama PIC"
            value={formData.namaPIC}
            onChange={handleChange}
            className="border p-2 mb-2 w-full"
          />
        </>
      )}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isEdit ? 'Update' : 'Tambah'} User
      </button>
    </div>
  );
}
