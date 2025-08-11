'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { FaCopy, FaPrint, FaDownload, FaSearch, FaEdit, FaTimes, FaRedo } from 'react-icons/fa';
import SuccessNotification from '@/components/SuccessNotification';

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
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState('welcome');
  const [userList, setUserList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [showSuccess, setShowSuccess] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ambil data dari localStorage saat mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers).map((user: any) => ({
        ...user,
        status: user.status || 'active',
      }));
      setUserList(parsedUsers);
    }

    const isNewDataAdded = localStorage.getItem('newDataAdded');
    if (isNewDataAdded === 'true') {
      setShowSuccess(true);
      localStorage.removeItem('newDataAdded');
    }

    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const path = pathname?.split('/')[1];
    setTab(path || 'welcome');
  }, [pathname]);

  // ✅ Filter hanya field string agar pencarian tidak error
  const filteredUsers = userList.filter((user) => {
    const search = searchTerm.toLowerCase();
    return Object.values(user).some((value) => 
      typeof value === 'string' && value.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleTambahUserClick = () => {
    setShowRoleDropdown((prev) => !prev);
  };

  const handleRoleSelect = (role: string) => {
    setShowRoleDropdown(false);
    const encodedRole = encodeURIComponent(role);
    router.push(`/user-management/add-user?role=${encodedRole}`);
  };

  const toggleStatus = (index: number) => {
    setPendingToggleIndex(indexOfFirstItem + index);
    const nextStatus = currentUsers[index].status === 'active' ? 'inactive' : 'active';
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

  const handleCopy = () => {
    const header = 'User ID,User Name,Nama User,Role,Status\n';
    const rows = filteredUsers.map(
      (user) =>
        `${user.userId},${user.username},${user.namaUser},${user.role},${user.status}`
    );
    const csv = header + rows.join('\n');
    navigator.clipboard.writeText(csv).then(() => {
      alert('Data user berhasil disalin ke clipboard!');
    });
  };

  const handlePrint = () => {
    const printContents = document.getElementById('user-table')?.outerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Users</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const header = 'User ID,User Name,Nama User,Role,Status\n';
    const rows = filteredUsers.map(
      (user) =>
        `${user.userId},${user.username},${user.namaUser},${user.role},${user.status}`
    );
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'user_list.csv');
    link.click();
  };

  

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="min-h-screen w-full p-8 mt-20">

        {showSuccess && (
          <SuccessNotification
            isOpen={showSuccess}
            message="User berhasil ditambahkan!"
            onClose={() => setShowSuccess(false)}
          />
        )}

        <div className="bg-white rounded-lg p-6 shadow-sm overflow-auto w-full">
          {/* Header Table */}
          <div className="flex justify-between items-center mb-4 relative min-w-max">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 rounded-md w-64 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-2 relative" ref={dropdownRef}>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-100"
              >
                <FaCopy /> Copy
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-100"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-100"
              >
                <FaDownload /> Download
              </button>

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

          {/* Table */}
          <div className="overflow-x-auto relative w-full max-h-[600px]">
            <table id="user-table" className="w-full text-left border border-gray-300 text-sm bg-white">
              <thead className="bg-gray-200 sticky top-0 z-50">
                <tr>
                  <th className="px-4 py-3 border w-28">User ID</th>
                  <th className="px-4 py-3 border w-40">User Name</th>
                  <th className="px-4 py-3 border w-32">Password</th>
                  <th className="px-4 py-3 border w-48">Nama User</th>
                  <th className="px-4 py-3 border w-32">Role</th>
                  <th className="px-4 py-3 border sticky right-0 bg-gray-200 z-50 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500 bg-white">
                      Belum ada user yang ditambahkan.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 border">{user.userId}</td>
                      <td className="px-4 py-3 border">{user.username}</td>
                      <td className="px-4 py-3 border">••••••••</td>
                      <td className="px-4 py-3 border">{user.namaUser}</td>
                      <td className="px-4 py-3 border">{user.role}</td>
                      <td className="px-10 py-5 sticky right-0 bg-white z-40 border w-28">
                        <div className="flex gap-3 relative z-50">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-500 flex items-center gap-1 hover:underline"
                          >
                            <FaEdit /> Edit
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => toggleStatus(index)}
                              className="text-red-600 flex items-center gap-1 hover:underline"
                            >
                              <FaTimes /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleStatus(index)}
                              className="text-green-500 flex items-center gap-1 hover:underline"
                            >
                              <FaRedo /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 px-4">
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 rounded-full px-1 py-1 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5 Data</option>
              <option value={10}>10 Data</option>
              <option value={20}>20 Data</option>
              <option value={50}>50 Data</option>
            </select>
          </div>


            <div className="flex items-center gap-2">
              {/* Tombol Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
              >
                {"<"}
              </button>

              {/* Nomor Halaman */}
              <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500">
                {currentPage}
              </span>

              {/* Tombol Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
              >
                {">"}
              </button>
            </div>

            <div>Total {filteredUsers.length}</div>
          </div>
        </div>

        {/* Modal */}
        <ModalConfirm
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
          title={
            targetStatus === 'inactive'
              ? 'Apakah kamu yakin, ingin mengnonaktifkan user ini?'
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
                  ? 'Kamu bisa mengembalikan kembali data yang sudah dihilangkan'
                  : 'kamu bisa menghapus kembali data yang sudah dipulihkan'}
              </div>
            </div>
          </div>
        </ModalConfirm>
      </main>
    </div>
  );
}
