'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
import Button from "@/components/button";
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import Pagination from '@/components/Pagination';
import SearchTable from '@/components/SearchTable';
import { useSort } from "@/hooks/useSort";
import { useListBranch } from "@/hooks/useBranch";
import { Branch, BranchDetail } from '@/interfaces/branch.interface';
import { Info } from 'lucide-react';

export default function KampusCabangPage() {
  const router = useRouter();

  const [refreshFlag, setRefreshFlag] = useState(0);
  const { data, isLoading, error } = useListBranch(refreshFlag);
  const branches = data?.data || [];

  // Ambil roleId dari localStorage
  const [roleId, setRoleId] = useState<number | null>(null);
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setRoleId(Number(parsed.roleId));
      } catch (e) {
        console.error("Gagal parse user:", e);
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalData, setModalData] = useState<BranchDetail[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State untuk modal tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // State untuk modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State untuk toggle status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL?.replace(/\/$/, '') || '';

  // Toggle status
  const toggleStatus = (branchId: number, currentStatus: 'active' | 'inactive') => {
    if (roleId !== 1) return; // Hanya Super User
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setTargetBranchId(branchId);
    setTargetStatus(newStatus);
    setShowStatusModal(true);
  };

  // ✅ SESUAIKAN DENGAN BACKEND YANG SUDAH ADA
  const confirmToggleStatus = async () => {
    if (targetBranchId === null || targetStatus === null) return;

    setIsUpdatingStatus(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('API URL tidak tersedia.');

      // ✅ Gunakan endpoint yang sudah ada di backend
      const endpoint = targetStatus === 'active'
        ? `/branch/activate/${targetBranchId}`
        : `/branch/deactivate/${targetBranchId}`;

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT', // bukan PATCH
        headers: { 'Content-Type': 'application/json' },
        // Tidak perlu body, karena backend sudah tahu status-nya
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gagal: ${text}`);
      }

      setSuccessMessage(`Kampus berhasil ${targetStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}!`);
      setShowSuccess(true);
      setRefreshFlag(f => f + 1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengubah status.');
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
    } finally {
      setShowStatusModal(false);
      setTargetBranchId(null);
      setTargetStatus(null);
      setIsUpdatingStatus(false);
    }
  };

  // Kolom tabel
  const columns = [
    { header: 'No', key: 'id', width: '60px', sortable: true },
    { header: 'Nama UPPS/KC', key: 'name', width: '250px', sortable: true },
    { header: 'Email', key: 'email', width: '300px', sortable: true },
   {
  header: 'Status',
  key: 'status',
  width: '120px',
  sortable: true,
  renderCell: (item: Branch) => (
    <div className="flex items-center gap-1">
      {item.status === 'active' ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l3.293 3.293a1 1 0 011.414 0l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-700 text-sm font-medium">Active</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 text-sm font-medium">Inactive</span>
        </>
      )}
    </div>
  ),
},
    {
      header: 'Logo',
      key: 'logoFile',
      width: '120px',
      sortable: false,
      renderCell: (item: Branch) => {
        const cleanPath = item.logoFile?.path?.replace(/^\/+/, "");
        const logoUrl = cleanPath ? `${ASSET_URL}/${cleanPath}` : null;
        return (
          <div className="flex justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`Logo ${item.name}`}
                className="w-10 h-10 object-contain border rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-logo.png';
                }}
              />
            ) : (
              <span className="text-gray-400">–</span>
            )}
          </div>
        );
      },
    },
   ...(roleId === 1 ? [{
  header: 'Aksi',
  key: 'actions',
  width: '180px', // perbesar sedikit untuk 2 tombol
  sortable: false,
  renderCell: (item: Branch) => (
    <div className="flex gap-2 sticky right-0 z-10 bg-white pl-2">
      {/* ✅ TOMBOL EDIT */}
      <button
        onClick={() => handleEditClick(item)}
        className="text-gray-600 hover:text-blue-600"
        title="Edit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>

      {/* ✅ TOMBOL ACTIVATE/DEACTIVATE */}
      <button
        onClick={() => toggleStatus(item.id, item.status)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          item.status === 'active'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
        title={item.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
      >
        {item.status === 'active' ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Deactivate</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l3.293 3.293a1 1 0 011.414 0l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Activate</span>
          </>
        )}
      </button>
    </div>
  ),
}] : []),
    {
      header: 'Detail',
      key: 'detail',
      width: '100px',
      sortable: false,
      renderCell: (item: Branch) => (
        <button
          onClick={() => handleDetailClick(item)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm sticky right-0 z-10"
        >
          Detail
        </button>
      ),
    },
  ];

  const filteredBranches = useMemo(() => {
    if (!searchTerm) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter(b => {
      const idMatch = b.id.toString().includes(term);
      const nameMatch = b.name.toLowerCase().includes(term);
      const emailMatch = b.email.toLowerCase().includes(term);
      const statusMatch = b.status.toLowerCase().includes(term);
      return idMatch || nameMatch || emailMatch || statusMatch;
    });
  }, [branches, searchTerm]);

  const { sortedData, requestSort, sortConfig } = useSort<Branch>(filteredBranches, "id");

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBranches = sortedData.slice(indexOfFirst, indexOfLast);

  // --- FUNGSI HANDLE LAINNYA (TIDAK BERUBAH) ---

  const handleDetailClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setModalData(branch.branchDetails);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBranch(null);
    setModalData([]);
  };

  const handleAddYear = () => {
    if (!selectedBranch) return;
    if (modalData.length === 0) {
      setModalData([{
        id: undefined as any,
        branchId: selectedBranch.id,
        year: 2021,
        studentBodyCount: 0,
        studyProgramCount: 0,
        superiorAccreditedStudyProgramCount: 0,
        accreditationGrowth: 0,
      }]);
      return;
    }
    const lastYear = Math.max(...modalData.map(d => d.year));
    const nextYear = lastYear + 1;
    setModalData(prev => [...prev, {
      id: undefined as any,
      branchId: selectedBranch!.id,
      year: nextYear,
      studentBodyCount: 0,
      studyProgramCount: 0,
      superiorAccreditedStudyProgramCount: 0,
      accreditationGrowth: 0,
    }]);
  };

  const handleRemoveYear = (year) => {
    if(confirm('Apakah akan menghapus data tahun ' + year + '?')){
      const filtered = modalData.filter(item => item.year !== year);
      setModalData(filtered)  
    }
  };

  const handleInputChange = (idOrYear: number, field: keyof BranchDetail, value: string) => {
    const newValue = value.replace(/[^0-9.]/g, '');
    let numValue: number;
    if (field === 'accreditationGrowth') {
      numValue = newValue === '' ? 0 : parseFloat(newValue) || 0;
    } else {
      numValue = newValue === '' ? 0 : parseInt(newValue) || 0;
    }
    setModalData(prev =>
      prev.map(item =>
        (item.id !== undefined && item.id === idOrYear) ||
        (item.id === undefined && item.year === idOrYear)
          ? { ...item, [field]: numValue }
          : item
      )
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedBranch) return;
    setIsSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL tidak ditemukan.');
      }
      const response = await fetch(`${baseUrl}/branch/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Gagal menyimpan: ${errorMsg}`);
      }
      setShowSuccess(true);
      setSuccessMessage('Data berhasil disimpan!');
      setIsDetailModalOpen(false);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      setErrorMessage('Gagal menyimpan: ' + (err as Error).message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditLogoPreview(null);
    }
  };

  const handleEditClick = (branch: Branch) => {
    setEditBranch(branch);
    setEditName(branch.name);
    setEditEmail(branch.email);
    setEditAddress(branch.address);
    setEditLogoFile(null);
    if (branch.logoFile?.path) {
      const cleanPath = branch.logoFile.path.replace(/^\/+/, "");
      const logoUrl = `${ASSET_URL}/${cleanPath}`;
      setEditLogoPreview(logoUrl);
    } else {
      setEditLogoPreview(null);
    }
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editBranch) return;

    const name = editName.trim();
    const email = editEmail.trim();
    const address = editAddress.trim();

    if (!name || !email) {
      setErrorMessage('Nama dan email wajib diisi.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const isNameDuplicate = branches.some(b => b.name === name && b.id !== editBranch.id);
    if (isNameDuplicate) {
      setErrorMessage(`Nama "${name}" sudah digunakan.`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const isEmailDuplicate = branches.some(b => b.email === email && b.id !== editBranch.id);
    if (isEmailDuplicate) {
      setErrorMessage(`Email "${email}" sudah digunakan.`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsEditing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('API URL tidak tersedia.');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('address', address);
      
      if (editLogoFile) {
        formData.append('logo', editLogoFile);
      }

      const response = await fetch(`${baseUrl}/branch/${editBranch.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gagal update: ${text}`);
      }

      setSuccessMessage('Data kampus berhasil diupdate!');
      setShowSuccess(true);
      setShowEditModal(false);
      setRefreshFlag(f => f + 1);
    } catch (err: any) {
      const msg = err.message || 'Gagal mengupdate kampus.';
      setErrorMessage(msg);
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddSubmit = async () => {
    const name = newName.trim();
    const email = newEmail.trim();
    const address = newAddress.trim();

    if (!name || !email) {
      setErrorMessage('Nama dan email wajib diisi.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (branches.some(b => b.name === name)) {
      setErrorMessage(`Nama "${name}" sudah terdaftar.`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (branches.some(b => b.email === email)) {
      setErrorMessage(`Email "${email}" sudah digunakan.`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsAdding(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('API URL tidak tersedia.');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('address', address);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch(`${baseUrl}/branch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gagal: ${text}`);
      }

      setRefreshFlag(f => f + 1);
      setSuccessMessage('Kampus cabang berhasil ditambahkan!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menambah kampus.';
      setErrorMessage(msg);
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && modalData.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [modalData]);

  const dataForExport = branches.flatMap(branch => {
    const rows: any[] = [];
    if (branch.branchDetails?.length > 0) {
      const firstDetail = branch.branchDetails[0];
      rows.push({
        No: branch.id,
        'Nama UPPS/KC': branch.name,
        Email: branch.email,
        Status: branch.status === 'active' ? 'Aktif' : 'Tidak Aktif',
        Tahun: firstDetail.year,
        'Jumlah Prodi': firstDetail.studyProgramCount,
        'Jumlah Prodi Terakreditasi Unggul': firstDetail.superiorAccreditedStudyProgramCount,
      });
      for (let i = 1; i < branch.branchDetails.length; i++) {
        const detail = branch.branchDetails[i];
        rows.push({
          No: "", 'Nama UPPS/KC': "", Email: "", Status: "",
          Tahun: detail.year,
          'Jumlah Prodi': detail.studyProgramCount,
          'Jumlah Prodi Terakreditasi Unggul': detail.superiorAccreditedStudyProgramCount,
        });
      }
    } else {
      rows.push({
        No: branch.id,
        'Nama UPPS/KC': branch.name,
        Email: branch.email,
        Status: branch.status === 'active' ? 'Aktif' : 'Tidak Aktif',
        Tahun: "Tidak ada data",
        'Jumlah Prodi': "",
        'Jumlah Prodi Terakreditasi Unggul': "",
      });
    }
    rows.push({ No: "", 'Nama UPPS/KC': "", Email: "", Status: "", Tahun: "", 'Jumlah Prodi': "", 'Jumlah Prodi Terakreditasi Unggul': "" });
    return rows;
  });

  if (isLoading) {
    return (
      <div className="flex">
        <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
          <div className="bg-white rounded-lg overflow-x-auto w-full p-4 mt-4 mx-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">Loading data dari server...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
          <div className="bg-white rounded-lg overflow-x-auto w-full p-4 mt-4 mx-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error: {error?.message || 'Terjadi kesalahan'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
        {showSuccess && (
          <SuccessNotification
            isOpen={showSuccess}
            message={successMessage}
            onClose={() => setShowSuccess(false)}
          />
        )}
        {showError && (
          <SuccessNotification
            isOpen={showError}
            message={errorMessage}
            onClose={() => setShowError(false)}
          />
        )}

        {/* Modal Konfirmasi Status */}
        {showStatusModal && (
          <ModalConfirm
            isOpen={showStatusModal}
            onCancel={() => {
              setShowStatusModal(false);
              setTargetBranchId(null);
              setTargetStatus(null);
            }}
            onConfirm={confirmToggleStatus}
            header={targetStatus === 'active' ? 'Aktifkan Kembali Data' : 'Non Aktifkan Data'}
            title={
              targetStatus === 'active'
                ? 'Apakah kamu yakin akan mengaktifkan kembali data ini?'
                : 'Apakah kamu yakin akan menonaktifkan data ini?'
            }
            confirmLabel={isUpdatingStatus ? 'Memproses...' : 'Ya, lakukan'}
            cancelLabel="Batal"
          >
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm flex items-start gap-3 mt-2">
              <Info size={20} className="mt-0.5 text-blue-500" />
              <div>
                <div className="font-semibold">Informasi</div>
                <div className="text-sm">
                  {targetStatus === 'active'
                    ? 'Kamu bisa menampilkan kembali data yang sudah disembunyikan.'
                    : 'Kamu bisa mengembalikan kembali data yang sudah dihilangkan.'}
                </div>
              </div>
            </div>
          </ModalConfirm>
        )}

        <div className="bg-white rounded-lg overflow-x-auto w-full p-10 mt-4">
          <div className="flex justify-between items-center mb-4 relative min-w-max">
            <SearchTable
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari kampus cabang..."
            />
            <div className="flex gap-2">
              <TableButton data={dataForExport} showCopy={false} />
              <Button onClick={() => setShowAddModal(true)} className="px-6">
                Tambah Kampus Cabang
              </Button>
            </div>
          </div>

          <TableUpdate
            key={refreshFlag}
            columns={columns}
            data={currentBranches}
            currentPage={currentPage}
            rowsPerPage={itemsPerPage}
            onSort={requestSort}
            sortConfig={sortConfig}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
            showTotalItems={true}
          />
        </div>

        {/* Modal Detail */}
        <ModalConfirm
          isOpen={isDetailModalOpen}
          onCancel={closeDetailModal}
          title=""
          header="Ubah Data Mahasiswa"
          footer={
            <div className="flex justify-center gap-4 mt-2">
              <Button
                variant="ghost"
                onClick={closeDetailModal}
                className="rounded-[2px] px-8 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2 text-sm font-medium"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddYear}
                className="px-4 py-2 font-medium"
              >
                + Tambah Tahun
              </Button>
            </div>
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto max-h-[350px] overflow-y-auto border rounded-lg"
            >
              <table className="min-w-full border-collapse border-gray-300">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Tahun</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Jumlah Prodi</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Jumlah Prodi Terakreditasi Unggul</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Jumlah Student Body</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Pertumbuhan Akreditasi Prodi</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((row) => (
                    <tr key={row.id ?? row.year}>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.year || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'year', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Tahun"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.studyProgramCount || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'studyProgramCount', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Jumlah Prodi"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.superiorAccreditedStudyProgramCount || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'superiorAccreditedStudyProgramCount', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Jumlah Prodi Terakreditasi Unggul"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.studentBodyCount || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'studentBodyCount', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Jumlah Student Body"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.accreditationGrowth || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'accreditationGrowth', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Pertumbuhan Akreditasi Prodi"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveYear(row.year)}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ModalConfirm>

        {/* Modal Tambah Kampus */}
        <ModalConfirm
          isOpen={showAddModal}
          onCancel={() => {
            setShowAddModal(false);
            setNewName('');
            setNewEmail('');
            setLogoFile(null);
            setLogoPreview(null);
          }}
          title=""
          header="Tambah Kampus Cabang Baru"
          footer={
            <div className="flex justify-center gap-4 mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setNewName('');
                  setNewEmail('');
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="rounded-[2px] px-8 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleAddSubmit}
                disabled={isAdding || !newName.trim() || !newEmail.trim()}
                className="px-8 py-2 text-sm font-medium"
              >
                {isAdding ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama UPPS/KC *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder="Contoh: Telkom University Surabaya"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder="contoh@telkomuniversity.ac.id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {logoPreview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={logoPreview}
                    alt="Preview logo"
                    className="w-20 h-20 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </ModalConfirm>

        {/* Modal Edit Kampus */}
        <ModalConfirm
          isOpen={showEditModal}
          onCancel={() => {
            setShowEditModal(false);
            setEditBranch(null);
            setEditName('');
            setEditEmail('');
            setEditLogoFile(null);
            setEditLogoPreview(null);
          }}
          title=""
          header="Edit Kampus Cabang"
          footer={
            <div className="flex justify-center gap-4 mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setEditBranch(null);
                  setEditName('');
                  setEditEmail('');
                  setEditLogoFile(null);
                  setEditLogoPreview(null);
                }}
                className="rounded-[2px] px-8 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleEditSubmit}
                disabled={isEditing || !editName.trim() || !editEmail.trim()}
                className="px-8 py-2 text-sm font-medium"
              >
                {isEditing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama UPPS/KC *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder="Nama kampus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder="Email kampus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-base"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditLogoChange}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editLogoPreview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={editLogoPreview}
                    alt="Preview logo"
                    className="w-20 h-20 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </ModalConfirm>
      </main>
    </div>
  );
}