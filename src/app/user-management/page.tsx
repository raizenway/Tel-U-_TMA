'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  username: string;
  password: string;
  namaUser: string;
  role: string;
  status?: 'active' | 'inactive';
}

export default function UserManagementPage() {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers).map((user: any) => ({
        ...user,
        status: user.status || 'active',
      }));
      setUserList(parsedUsers);
    }
  }, []);

  const handleTambahUserClick = () => {
    setShowRoleDropdown(prev => !prev);
  };

  const handleRoleSelect = (role: string) => {
    setShowRoleDropdown(false);
    const encodedRole = encodeURIComponent(role);
    router.push(`/user-management/add-user?role=${encodedRole}`);
  };

  const toggleStatus = (index: number) => {
    const updatedUsers = [...userList];
    updatedUsers[index].status =
      updatedUsers[index].status === 'active' ? 'inactive' : 'active';
    setUserList(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User Management</h1>

      <div className="bg-gray-100 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 relative">
          <input
            type="text"
            placeholder="Search user..."
            className="border border-gray-300 px-3 py-2 rounded-md w-64"
          />

          <div className="flex gap-2 relative" ref={dropdownRef}>
            <button className="px-4 py-2 border rounded bg-white hover:bg-gray-200">Copy</button>
            <button className="px-4 py-2 border rounded bg-white hover:bg-gray-200">Print</button>
            <button className="px-4 py-2 border rounded bg-white hover:bg-gray-200">Download ⏷</button>

            <div className="relative">
              <button
                onClick={handleTambahUserClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Tambah User
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-300 rounded shadow-md z-10">
                  <button
                    onClick={() => handleRoleSelect('UPPS/KC')}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                  >
                    UPPS/KC
                  </button>
                  <button
                    onClick={() => handleRoleSelect('Non SSO')}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                  >
                    Non SSO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="w-full text-left border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">User ID</th>
              <th className="p-3 border">User Name</th>
              <th className="p-3 border">Password</th>
              <th className="p-3 border">Nama User</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {userList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Belum ada user yang ditambahkan.
                </td>
              </tr>
            ) : (
              userList.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 border">{user.userId}</td>
                  <td className="p-3 border">{user.username}</td>
                  <td className="p-3 border">••••••••</td>
                  <td className="p-3 border">{user.namaUser}</td>
                  <td className="p-3 border">{user.role}</td>
                  <td className="border px-2 py-1">
                    <button className="text-blue-500 mr-2">✏️ Edit</button>
                    {user.status === 'active' ? (
                      <button onClick={() => toggleStatus(index)} className="text-red-600 hover:underline">❌ Deactivate</button>
                    ) : (
                      <button onClick={() => toggleStatus(index)} className="text-green-500 hover:underline">🔁 Reactive</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
