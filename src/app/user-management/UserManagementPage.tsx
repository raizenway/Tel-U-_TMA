'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
import Button  from "@/components/button";
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import Pagination from '@/components/Pagination';
import SearchTable from '@/components/SearchTable';


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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Kolom Tabel
  const columns = [
  { header: 'User ID', key: 'userId', width: '140px', sortable: true },
  { header: 'User Name', key: 'username', width: '160px', sortable: true },
  { header: 'Password', key: 'password', width: '120px', sortable: false },
  { header: 'Nama User', key: 'namaUser', width: '200px', sortable: true },
  { header: 'Role', key: 'role', width: '140px', sortable: true },
  { header: 'Status', key: 'status', width: '100px', sortable: true },
  { 
    header: 'Aksi', 
    key: 'action', 
    width: '180px', 
    sortable: false, 
    className: 'sticky right-0 bg-gray-100 z-10' 
  },
];


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


  // ✅ Filter dan Sort data
const processedUsers = React.useMemo(() => {
  let result = [...userList];

  // 1. Filter berdasarkan pencarian
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    result = result.filter((user) =>
      (user.userId && user.userId.toLowerCase().includes(search)) ||
      user.username.toLowerCase().includes(search) ||
      user.namaUser.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      user.status.toLowerCase().includes(search) ||
      (user.namaPIC && user.namaPIC.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.nomorHp && user.nomorHp.toLowerCase().includes(search))
    );
  }

  // 2. Sort berdasarkan sortConfig
  if (sortConfig) {
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Case-insensitive untuk string
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
}, [userList, searchTerm, sortConfig]);

// Pagination
const totalItems = processedUsers.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentUsers = processedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
  const globalIndex = indexOfFirstItem + index; // Konversi ke index global
  setPendingToggleIndex(globalIndex);
  const nextStatus = userList[globalIndex].status === 'active' ? 'inactive' : 'active';
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

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const dataForExport = currentUsers.map((item) => ({
  'User ID': item.userId,
  'User Name': item.username,
  Password: item.password,
  'Nama User': item.namaUser,
  Role: item.role,
  Status: item.status,
}));
  

  return (
    <div className="flex">
      <main className=" w-full">

        {showSuccess && (
          <SuccessNotification
            isOpen={showSuccess}
            message="User berhasil ditambahkan!"
            onClose={() => setShowSuccess(false)}
          />
        )}

        <div className="bg-white rounded-lg  overflow-auto w-full">
          {/* Header Table */}
          <div className="flex justify-between items-center mb-4 relative min-w-max">
            <SearchTable
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari user..."
              className="mb-2"
            />

            <div className="flex gap-2 relative" ref={dropdownRef}>
              <TableButton data={dataForExport}/>
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
        <TableUpdate
          columns={columns}
          data={currentUsers.map(user => ({
            ...user,
            password: '••••••••',
            // ❌ JANGAN ubah status! Biarkan tetap 'active' atau 'inactive'
          }))}
          currentPage={currentPage}
          rowsPerPage={itemsPerPage}
          onEdit={handleEditUser}
          onDeactivate={(index) => toggleStatus(index)}
          onReactivate={(index) => toggleStatus(index)}
          onSort={handleSort}
        sortConfig={sortConfig}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={processedUsers.length}
          onItemsPerPageChange={(value) => setItemsPerPage(value)}
          showItemsPerPage={true}
          showTotalItems={true}
        />
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

