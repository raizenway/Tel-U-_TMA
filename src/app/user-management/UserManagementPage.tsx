'use client';
import React, { useState, useRef, useEffect, useMemo} from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
import Button  from "@/components/button";
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import Pagination from '@/components/Pagination';
import SearchTable from '@/components/SearchTable';
import { useSort } from "@/hooks/useSort";
import { useListUsers,  useActivateUser, useDeactivateUser, useListBranches  } from "@/hooks/useUserManagement"; // ← Tambahkan import
import { User } from "@/interfaces/user-management";
import { BRANCH_NAMES } from '@/interfaces/branch';


export default function UserManagementPage() {
  const router = useRouter();
  
// Refresh data dari API
const [refreshFlag, setRefreshFlag] = useState(0);
const { data, loading, error } = useListUsers(refreshFlag);
 // DATA DARI API
const users = data?.data || [];
 // Ambil data kampus cabang
const { data: branchData, loading: branchLoading, error: branchError } = useListBranches();

const branchNames = useMemo(() => {
  if (!branchData?.data) return {};
  return branchData.data.reduce((acc, branch) => {
    acc[branch.id] = branch.name;
    return acc;
  }, {} as Record<number, string>);
}, [branchData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mapping roleId ke nama role
 const roleNames: Record<number, string> = {
  2: 'UPPS/KC',
  4: 'Non-SSO',
};

const [successMessage, setSuccessMessage] = useState("User berhasil ditambahkan!");

  // Kolom Tabel
  const columns = [
  { header: 'Nomor', key: 'id', width: '140px', sortable: true },
  { header: 'User Name', key: 'username', width: '160px', sortable: true },
  { header: 'Nama User', key: 'fullname', width: '200px', sortable: true },
  { header: 'Role', key: 'roleId', width: '140px', sortable: true },
  { header: 'Kampus Cabang', key: 'branchId', width: '180px', sortable: true },
  { header: 'Email', key: 'email', width: '180px', sortable: true },
  { header: 'Status', key: 'status', width: '100px', sortable: true },
  { 
    header: 'Aksi', 
    key: 'action', 
    width: '180px', 
    sortable: false, 
    className: 'sticky right-0 bg-gray-100 z-10' 
  },
];

// Tambahkan ini di atas useEffect
const { mutate: activateUser } = useActivateUser();
const { mutate: deactivateUser } = useDeactivateUser();


  // 1. Filter data berdasarkan pencarian
const filteredUsers = useMemo(() => {
  if (!searchTerm) return users;
  const search = searchTerm.toLowerCase();
  return users.filter((user) =>
    user.id.toString().includes(search) ||
    user.username.toLowerCase().includes(search) ||
    user.fullname.toLowerCase().includes(search) ||
    user.roleId.toString().includes(search) ||
    user.status.toLowerCase().includes(search)
  );
}, [users, searchTerm]);

 // Sorting
  const { sortedData, requestSort, sortConfig } = useSort<User>(filteredUsers, "id");

 useEffect(() => {
  const newDataAdded = localStorage.getItem('newDataAdded');
  const editDataSuccess = localStorage.getItem('editDataSuccess');

  if (newDataAdded === 'true') {
    setSuccessMessage("User berhasil ditambahkan!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    localStorage.removeItem('newDataAdded');
  }

  if (editDataSuccess === 'true') {
    setSuccessMessage("Data berhasil diperbarui!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    localStorage.removeItem('editDataSuccess');
  }
}, []);
  
// Pagination
const totalItems = sortedData.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentUsers = sortedData.slice(indexOfFirstItem, indexOfLastItem);

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
  const globalIndex = indexOfFirstItem + index;
  const user = sortedData[globalIndex]; // ✅ Gunakan sortedData, bukan users

  if (!user) return;

  setPendingToggleIndex(globalIndex);
  setTargetStatus(user.status === 'active' ? 'inactive' : 'active');
  setShowModal(true);
};

const handleConfirm = async () => {
  if (pendingToggleIndex === null || targetStatus === null) {
    setShowModal(false);
    return;
  }

  try {
    const user = sortedData[pendingToggleIndex]; // Ambil user dari data yang sedang ditampilkan
    if (!user) throw new Error("User tidak ditemukan");

    // Panggil API sesuai status tujuan
    if (targetStatus === 'active') {
      await activateUser(user.id); // Aktifkan user
    } else {
      await deactivateUser(user.id); // Nonaktifkan user
    }

    // Trigger refresh data dari API
    setRefreshFlag(prev => prev + 1);

    // Tampilkan notifikasi sukses
    setSuccessMessage(
      targetStatus === 'active' 
        ? "User berhasil diaktifkan!" 
        : "User berhasil dinonaktifkan!"
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  } catch (err: any) {
    alert(`Gagal mengubah status: ${err.message}`);
  } finally {
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  }
};

 const handleEditUser = (user: User) => {
  // Simpan data asli dari API
  localStorage.setItem('selectedUser', JSON.stringify({
    userId: user.id.toString(),
    username: user.username,
    fullname: user.fullname,
    email: user.email,
    phone_number: user.phone_number,
    roleId: user.roleId,
    status: user.status,
  }));
  router.push(`/user-management/edit-user?userId=${user.id}`);
};

// Siapkan data yang sudah dimodifikasi untuk tabel
const processedUsers = currentUsers.map(user => ({
  ...user,
  // Ambil nama role langsung dari objek role yang dikirim API
  roleId: user.role?.name || 'Role tidak ditemukan',

  // Untuk branch, tetap gunakan BRANCH_NAMES jika belum ada mapping dari API
  branchId: BRANCH_NAMES[user.branchId] || `Cabang ${user.branchId}`,

  password: '••••••',
}));

const dataForExport = processedUsers.map((user) => ({
  'User ID': user.id,
  'User Name': user.username,
  'Nama User': user.fullname,
  Role: user.roleId, 
  'Kampus Cabang': branchNames[user.branchId] || user.branchId,
  Status: user.status,
}));


// Loading & Error
if (loading) return <p className="p-6">Loading data dari server...</p>;
if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

console.log("Data users:", users);

  return (
    <div className="flex">
      <main className=" w-full">

        {showSuccess && (
          <SuccessNotification
            isOpen={showSuccess}
            message={successMessage}
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
          data={processedUsers}
          currentPage={currentPage}
          rowsPerPage={itemsPerPage}
          onEdit={handleEditUser}
          onDeactivate={(index) => toggleStatus(index)}
          onReactivate={(index) => toggleStatus(index)}
          onSort={requestSort}
        sortConfig={sortConfig}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={sortedData.length}
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

