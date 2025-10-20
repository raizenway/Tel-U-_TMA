'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
import Button from "@/components/button";
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import Pagination from '@/components/Pagination';
import SearchTable from '@/components/SearchTable';
import { useSort } from "@/hooks/useSort";
import { useListPeriode, useActivatePeriode, useDeactivatePeriode, useCreatePeriode, useUpdatePeriode } from "@/hooks/usePeriode";
import { Periode } from "@/interfaces/periode";
import ModalAddPeriode from '@/components/ModalAddPeriode'; // 👈 import komponen modal baru
import ModalEditPeriode from '@/components/ModalEditPeriode'; // 👈 TAMBAHKAN INI
import { formatStatus } from '@/lib/api-periode';



export default function PeriodePage() {
  const router = useRouter();
  
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { data, loading, error } = useListPeriode(refreshFlag);
  const periodes = data?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false); // 👈 state untuk modal tambah
  const [showEditModal, setShowEditModal] = useState(false); // 👈 TAMBAHKAN INI
  const [editingPeriode, setEditingPeriode] = useState<Periode | null>(null); // 👈 TAMBAHKAN INI


  const { mutate: createPeriode, loading: creating, error: createError } = useCreatePeriode();
  const { mutate: updatePeriode, loading: updating, error: updateError } = useUpdatePeriode(); 

  const [isToggling, setIsToggling] = useState(false); // ✅ tambahkan ini

  // Kolom tabel
  const columns = [
    { header: 'ID', key: 'id', width: '80px', sortable: true },
    { header: 'Tahun', key: 'tahun', width: '120px', sortable: true },
    { header: 'Semester', key: 'semester', width: '120px', sortable: true },
    { header: 'Status', key: 'status', width: '100px', sortable: true },
    {
      header: 'Aksi',
      key: 'action',
      width: '180px',
      sortable: false,
      className: 'sticky right-0 bg-gray-100 z-10'
    },
  ];

  // Filter
const filteredPeriodes = useMemo(() => {
  if (!searchTerm) return periodes;

  const term = searchTerm.toLowerCase();

  return periodes.filter(p => {
    const idMatch = p.id.toString().includes(term);
    const tahunMatch = p.tahun.toString().includes(term);
    const semesterMatch = p.semester?.toString().toLowerCase().includes(term) ?? false;
    
    // Gunakan formatStatus() agar cocok dengan tampilan pengguna ("Aktif", bukan "active")
    const statusDisplay = formatStatus(p.status).toLowerCase();
    const statusMatch = statusDisplay.includes(term);

    return idMatch || tahunMatch || semesterMatch || statusMatch;
  });
}, [periodes, searchTerm]);

  // Sort
  const { sortedData, requestSort, sortConfig } = useSort<Periode>(filteredPeriodes, "id");

  // ✅ FORMAT STATUS DI sortedData DULU
const formattedSortedData = sortedData.map(p => ({
  ...p,
  status: formatStatus(p.status), // 👈 Ini yang penting!
}));

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPeriodes = sortedData.slice(indexOfFirst, indexOfLast);

  const handleTambah = () => {
    setShowAddModal(true); // 👈 buka modal
  };

  const toggleStatus = (index: number) => {
    const globalIndex = indexOfFirst + index;
    const periode = sortedData[globalIndex];
    if (!periode) return;
    setPendingToggleIndex(globalIndex);
    setTargetStatus(periode.status === 'active' ? 'inactive' : 'active');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (pendingToggleIndex === null || targetStatus === null) {
      setShowModal(false);
      return;
    }

    const periode = sortedData[pendingToggleIndex];
    if (!periode) return;

    setIsToggling(true);

    try {
      // ✅ PAKAI updatePeriode — bukan activate/deactivate
      await updatePeriode(periode.id, {
        tahun: periode.tahun,
        semester: periode.semester,
        status: targetStatus, // ← ini akan kirim 'active' atau 'inactive'
      });

      setRefreshFlag(f => f + 1);
      setSuccessMessage(targetStatus === 'active' ? 'Periode diaktifkan!' : 'Periode dinonaktifkan!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Gagal mengubah status');
    } finally {
      setIsToggling(false);
      setShowModal(false);
      setPendingToggleIndex(null);
      setTargetStatus(null);
    }
  };

  const handleEdit = (periode: Periode) => {
    setEditingPeriode(periode); // simpan data periode
    setShowEditModal(true);     // buka modal
  };

  console.log('[DEBUG] Data dari API:', data?.data);



  const dataForExport = currentPeriodes.map(p => ({
    ID: p.id,
    Tahun: p.tahun,
    Semester: p.semester,
    Status: p.status, // 👈 Sudah 'Aktif' atau 'Nonaktif'
  }));

  const [successMessage, setSuccessMessage] = useState('');

  if (loading) {
    return (
      <div className="flex">
        <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
          <div className="bg-white rounded-lg overflow-x-auto w-full p-4 mt-4 mx-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-black-600">Loading data dari server...</p>
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
              <p className="text-red-500">Error: {error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleAddSubmit = async (formData: { 
    tahun: number; 
    semester: string;  // ✅ string
    status: 'active' | 'inactive' 
  }) => {
    const existing = periodes.find(p => 
      p.tahun === formData.tahun && 
      p.semester === formData.semester // string === string
    );
    if (existing) {
      alert(`Periode ${formData.tahun} Semester ${formData.semester} sudah ada!`);
      return;
    }


  try {
    await createPeriode(formData); // formData sudah sesuai tipe useCreatePeriode
    setRefreshFlag(f => f + 1);
    setSuccessMessage('Periode berhasil ditambahkan!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setShowAddModal(false);
} catch (err: any) {
  let message = 'Gagal menambahkan periode';
  if (err?.message && err.message.includes('HTTP 409')) {
    message = "Periode ini sudah ada di sistem. Silakan pilih tahun dan semester lain.";
  } else if (err?.message && err.message.includes('HTTP 400')) {
    message = "Tahun harus antara 2000 - 2100";
  } else if (err?.message) {
    try {
      const json = JSON.parse(err.message.split('HTTP ')[1]?.split(': ')[1] || '{}');
      if (json.errors?.message) {
        message = json.errors.message;
      } else if (json.message) {
        message = json.message;
      }
    } catch (e) {
      message = err.message;
    }
  }
  alert(message);
}
};

const handleEditSubmit = async (id: number, formData: { 
  tahun: number; 
  semester: string; 
  status: 'active' | 'inactive' 
}) => {
  try {
    await updatePeriode(id, formData);
    setRefreshFlag(f => f + 1);
    setSuccessMessage('Periode berhasil diperbarui!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setShowEditModal(false);
    setEditingPeriode(null);
  } catch (err: any) {
    let message = 'Gagal memperbarui periode';
    if (err?.message && err.message.includes('HTTP 409')) {
      message = "Periode ini sudah ada di sistem. Silakan pilih tahun dan semester lain.";
    } else if (err?.message && err.message.includes('HTTP 400')) {
      message = "Tahun harus antara 2000 - 2100";
    } else if (err?.message) {
      try {
        const json = JSON.parse(err.message.split('HTTP ')[1]?.split(': ')[1] || '{}');
        if (json.errors?.message) {
          message = json.errors.message;
        } else if (json.message) {
          message = json.message;
        }
      } catch (e) {
        message = err.message;
      }
    }
    alert(message);
  }
};

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

        <div className="bg-white rounded-lg overflow-x-auto w-full p-10 mt-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 relative min-w-max">
            <SearchTable
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari periode..."
            />
            <div className="flex gap-2">
              <TableButton data={dataForExport} showCopy={false} />
              <Button onClick={handleTambah} className="px-6">
                Tambah Periode
              </Button>
            </div>
          </div>

          {/* Tabel */}
          <TableUpdate
            key={refreshFlag}
            columns={columns}
            data={currentPeriodes}
            currentPage={currentPage}
            rowsPerPage={itemsPerPage}
            onEdit={handleEdit}
            onDeactivate={(i) => toggleStatus(i)}
            onReactivate={(i) => toggleStatus(i)}
            onSort={requestSort}
            sortConfig={sortConfig}
          />

          {/* Pagination */}
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

        {/* Modal Konfirmasi */}
        <ModalConfirm
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
          title={
            targetStatus === 'inactive'
              ? 'Nonaktifkan periode ini?'
              : 'Aktifkan kembali periode ini?'
          }
          header={targetStatus === 'inactive' ? 'Nonaktifkan Periode' : 'Aktifkan Periode'}
          confirmLabel="Ya"
          cancelLabel="Batal"
        >
          <p className="text-sm text-gray-600">
            {targetStatus === 'inactive'
              ? 'Periode ini tidak akan muncul di sistem.'
              : 'Periode ini akan kembali aktif di sistem.'}
          </p>
        </ModalConfirm>

          {/* Modal Tambah Periode */}
        <ModalAddPeriode
          isOpen={showAddModal}
          onCancel={() => setShowAddModal(false)}
          onConfirm={handleAddSubmit}
          title="Tambah Periode Baru"
          header="Tambah Periode"
          periodes={periodes} // 👈 TAMBAHKAN INI
        />

        {/* Modal Edit Periode */}
        <ModalEditPeriode
          isOpen={showEditModal}
          onCancel={() => {
            setShowEditModal(false);
            setEditingPeriode(null);
          }}
          onConfirm={handleEditSubmit}
          title="Edit Periode"
          header="Edit Periode"
          periode={editingPeriode}
          periodes={periodes} 
        />
      </main>
    </div>
  );
} 