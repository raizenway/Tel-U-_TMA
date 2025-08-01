'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";

interface User {
  userId: string;
  username: string;
  password: string;
  namaUser: string;
  role: string;
  status: 'active' | 'inactive';
  namaPIC?: string;
  email?: string;
  nomorHp?: string;
  logoFile?: string;
}

export default function UserManagementPage() {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
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
    setPendingToggleIndex(index);
    const nextStatus = userList[index].status === 'active' ? 'inactive' : 'active';
    setTargetStatus(nextStatus);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (pendingToggleIndex !== null) {
      const updatedUsers = [...userList];
      updatedUsers[pendingToggleIndex].status =
        updatedUsers[pendingToggleIndex].status === 'active' ? 'inactive' : 'active';
      setUserList(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  const handleEditUser = (user: User) => {
    localStorage.setItem('selectedUser', JSON.stringify(user));
    router.push(`/user-management/edit-user?userId=${user.userId}`);
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User Management</h1>

      <div className="bg-gray-100 rounded-lg p-6 shadow-sm overflow-auto">
        <div className="flex justify-between items-center mb-4 relative min-w-max">
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
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-300 rounded shadow-md z-[9999]">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-300 text-sm min-w-max">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 border">User ID</th>
                <th className="p-3 border">User Name</th>
                <th className="p-3 border">Password</th>
                <th className="p-3 border">Nama User</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Nama PIC</th>
                <th className="p-3 border">Nomor Handphone</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Logo UPPS/KC</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border sticky right-0 bg-gray-200 z-10 w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center p-4 text-gray-500">
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
                    <td className="p-3 border">{user.namaPIC || '-'}</td>
                    <td className="p-3 border">{user.nomorHp || '-'}</td>
                    <td className="p-3 border">{user.email || '-'}</td>
                    <td className="p-3 border">
                      {user.role === 'UPPS/KC' ? user.logoFile || 'logo.png' : '-'}
                    </td>
                    <td className="p-3 border capitalize">{user.status}</td>
                    <td className="border px-2 py-1 sticky right-0 bg-white z-10 w-40">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-500 mr-2 hover:underline"
                      >
                        ✏️ Edit
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => toggleStatus(index)}
                          className="text-red-600 hover:underline"
                        >
                          ❌ Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(index)}
                          className="text-green-500 hover:underline"
                        >
                          🔁 Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <div className="custom-modal-width">
        <ModalConfirm
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
          title={
            targetStatus === 'inactive'
              ? 'Apakah kamu yakin, kamu ingin menonaktifkan user ini?'
              : 'Apakah kamu yakin, kamu ingin mengaktifkan kembali data ini?'
          }
          header={
            targetStatus === 'inactive'
              ? 'Non Aktifkan User'
              : 'Aktifkan Kembali Data'
          }
          confirmLabel="Ya, lakukan"
          cancelLabel="Batal"
        >
          <div className="bg-blue-100 border-l-4 text-blue-700 p-4 rounded-md text-sm flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
              i
            </div>
            <div className="text-left">
              <div className="font-semibold text-base mb-1">Informasi</div>
              <div className="pl-1">
                {targetStatus === 'inactive'
                  ? 'kamu bisa mengembalikan kembali data yang sudah dihilangkan'
                  : 'kamu bisa menghapus kembali data yang sudah dipulihkan'}
              </div>
            </div>
          </div>
        </ModalConfirm>
      </div>
    </main>
  );
}
