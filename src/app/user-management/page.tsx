'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
 import Button  from "@/components/button";
import { Download, Printer, ChevronDown, Copy, } from "lucide-react";
import { FaSearch, FaEdit,FaTimes, FaRedo } from "react-icons/fa";
import * as XLSX from 'xlsx';





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
  if (!searchTerm) return true; // Jika kosong, tampilkan semua

  const search = searchTerm.toLowerCase();

  return (
    user.userId.toLowerCase().includes(search) ||
    user.username.toLowerCase().includes(search) ||
    user.namaUser.toLowerCase().includes(search) ||
    user.role.toLowerCase().includes(search) ||
    user.status.toLowerCase().includes(search) ||
    (user.namaPIC && user.namaPIC.toLowerCase().includes(search)) ||
    (user.email && user.email.toLowerCase().includes(search)) ||
    (user.nomorHp && user.nomorHp.toLowerCase().includes(search))
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
  const table = document.getElementById('user-table');
  if (!table) return;

  // Ambil konten tabel
  const tableHTML = table.outerHTML;

  // Buka jendela baru
  const printWindow = window.open('', '', 'width=1000,height=800');
  if (!printWindow) return;

  // CSS khusus untuk print (termasuk media print)
  const printCSS = `
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 20px;
        color: #000;
        background: #fff;
      }
      .print-header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 3px double #000;
        padding-bottom: 10px;
      }
      .print-header h1 {
        margin: 0;
        font-size: 1.8em;
        font-weight: bold;
      }
      .print-header p {
        margin: 5px 0;
        color: #333;
        font-size: 1em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: auto;
        margin-top: 20px;
        border: 1px solid #000;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px 10px;
        text-align: left;
        vertical-align: top;
        font-size: 0.85em;
        word-wrap: break-word;
      }
      th {
        background-color: #eee;
        font-weight: bold;
        text-transform: uppercase;
      }
      img {
        max-height: 30px;
        max-width: 120px;
        object-fit: contain;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .text-center {
        text-align: center;
      }
      .text-right {
        text-align: right;
      }
      .text-gray {
        color: #666;
      }
      .no-data {
        text-align: center;
        font-style: italic;
        color: #777;
      }

      /* Aturan khusus saat print */
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
        }
        @page {
          margin: 1.5cm;
          size: landscape;
          orientation: landscape;
        }
        table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
      }
    </style>
  `;

  // Header cetak
  const headerHTML = `
    <div class="print-header">
      <h1>Daftar Pengguna</h1>
      <p>Sistem Manajemen User - ${new Date().toLocaleDateString('id-ID')}</p>
    </div>
  `;

  // Tulis ke jendela print
  printWindow.document.write(`
    <html>
      <head>
        <title>Print - User Management</title>
        ${printCSS}
      </head>
      <body>
        ${headerHTML}
        ${tableHTML}
        <script>
          // Tunggu gambar termuat, lalu langsung print
          setTimeout(() => {
            window.print();
            // Optional: tutup jendela setelah print
            window.onafterprint = () => window.close();
          }, 500);
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

// Tambahkan fungsi ini di dalam component UserManagementPage
const handleDownload = () => {
  // Pastikan kita di browser
  if (typeof window === 'undefined') return;

  // Siapkan data untuk Excel
  const worksheetData = [
    ['User ID', 'User Name', 'Password', 'Nama User', 'Role', 'Status'], // Header
    ...filteredUsers.map(user => [
      user.userId,
      user.username,
      '••••••••', // Hindari password asli
      user.namaUser,
      user.role,
      user.status === 'active' ? 'Aktif' : 'Nonaktif'
    ])
  ];

  // Buat worksheet dari array
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Styling: Lebar kolom
  const colWidths = [
    { wch: 15 }, // User ID
    { wch: 20 }, // User Name
    { wch: 15 }, // Password
    { wch: 25 }, // Nama User
    { wch: 20 }, // Role
    { wch: 15 }  // Status
  ];
  worksheet['!cols'] = colWidths;

  // Buat workbook dan tambahkan worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Pengguna');

  // Download file
  XLSX.writeFile(workbook, 'daftar_pengguna.xlsx');
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
              <Button
               variant="outline"
               icon={Copy}
              iconPosition="left" 
              onClick={handleCopy}
               >
                Copy
                </Button>

              <Button
                             variant="outline"
                             icon={Printer}
                            iconPosition="left" 
                            onClick={handlePrint}
                             >
                              Print
                              </Button>

              <Button
               variant="outline"
               icon={ChevronDown}
              iconPosition="right" 
                  onClick={handleDownload}
               >
                Download
                </Button>
                

              <div className="relative">

                <Button 
                
                className="px-8"
                onClick={handleTambahUserClick}
                >    
                Tambah User
              </Button>
                
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
{/* Table */}
<div className="overflow-x-auto w-full max-h-[600px]">
  <table
    id="user-table"
    className="w-full border border-gray-300 text-sm bg-white"
    style={{ tableLayout: 'auto', minWidth: 'max-content' }}
  >
    <thead className="bg-gray-200 sticky top-0 z-50">
      <tr>
        <th className="px-4 py-3 border w-auto">User ID</th>
        <th className="px-4 py-3 border w-auto">User Name</th>
        <th className="px-4 py-3 border w-auto">Password</th>
        <th className="px-4 py-3 border w-auto">Nama User</th>
        <th className="px-4 py-3 border w-auto">Role</th>
        <th className="px-4 py-3 border sticky right-0 bg-gray-200 z-50 w-auto">Aksi</th>
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
            <td className="px-4 py-5 sticky right-0 bg-white z-40 border whitespace-nowrap">
              <div className="flex gap-3">
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
              : 'Apakah kamu yakin, kamu akan mengaktifkan kembali data ini?'
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

