'use client';

import React, { useState, useMemo, useEffect } from 'react'; // ✅ Tambah useEffect
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ Tambah useSearchParams
import Button from '@/components/button';
import TableUpdate from '@/components/TableUpdate';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import TableButton from '@/components/TableButton';
import SearchTable from '@/components/SearchTable';
import Pagination from '@/components/Pagination';
import { Info as LucideInfo } from 'lucide-react';
import SuccessNotification from '@/components/SuccessNotification';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';
import { useUpdateTransformationVariable } from '@/hooks/useTransformationVariableList';
import RoleBasedStatusCell from '@/components/RoleBasedStatusCell';

// ✅ Tambahkan ini
type TableItem = {
  id: number;
  nama: string;
  bobot: string | number;
  deskripsi: string;
  referensi: string;
  logoUrl: any;
  status: string;
  nomor_urut: number; // <-- ini yang baru
};

export default function AssessmentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // ✅ Tambah ini
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
  key: 'id',
  direction: 'asc',
});

  // 🔹 Ambil searchParams
  const searchParams = useSearchParams();

   // 🔹 Tambahkan state roleId
    const [roleId, setRoleId] = useState<number | null>(null);
  
    // 🔹 Ambil roleId dari localStorage
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
  

  // 🔹 Tambah useEffect untuk baca query 'success'
  useEffect(() => {
    const successType = searchParams.get('success');
    if (successType) {
      let message = '';
      if (successType === 'created') {
        message = 'Variable baru berhasil ditambahkan!';
      } else if (successType === 'updated') {
        message = 'Perubahan variable berhasil disimpan!';
      } else if (successType === 'true') {
        message = 'Variable berhasil disimpan!';
      }

      if (message) {
        setSuccessMessage(message);
        setShowSuccess(true);

        // Hapus query dari URL
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    }
  }, [searchParams, router]);

  //Ambil data
  const { data, loading, error, refetch } = useTransformationVariableList();

  // 🔹 Ambil mutate
  const { mutate: updateVariable, loading: updating } = useUpdateTransformationVariable();

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded">
        {error} 
      </div>
    );
  }

  // Format data tabel
  const tableData = data.map((item) => ({
    id: item.id,
    nama: item.name || '-',
    bobot: item.weight || '-',
    deskripsi: item.description || '-',
    referensi: item.reference || '-',
    logoUrl: null,
    status: item.status === 'active' ? 'Active' : 'Inactive',
  }));

  //Sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  //Filter
  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  //Pagination
  //Pagination
const totalData = filteredData.length;
const totalPages = Math.ceil(totalData / rowsPerPage);
const startIndex = (currentPage - 1) * rowsPerPage;
const currentData = filteredData
  .slice(startIndex, startIndex + rowsPerPage)
  .map((item, index): TableItem => ({
    ...item,
    nomor_urut: startIndex + index + 1, // ✅ Nomor urut tampilan: 1, 2, 3...
  }));

  //modal
  const openConfirmModal = (id: number, action: 'activate' | 'deactivate') => {
    setItemId(id);
    setModalAction(action);
    setShowModal(true);
  };

  //HOOK UPDATE
  const handleToggleStatus = async () => {
    if (itemId === null) return;

    try {
      
      const currentItem = data.find(item => item.id === itemId);
      if (!currentItem) throw new Error('Data tidak ditemukan');

      
      const newStatus = currentItem.status === 'active' ? 'inactive' : 'active';

      //hook
      await updateVariable(itemId, {
        name: currentItem.name,
        weight: currentItem.weight,
        description: currentItem.description,
        reference: currentItem.reference,
        sortOrder: currentItem.sortOrder || 1,
        status: newStatus,
      });

      // Refresh daftar setelah update
        await refetch();

        // ✅ Force re-sort agar urutan tetap sesuai sort terakhir
        if (sortConfig) {
          setSortConfig({ ...sortConfig }); // <-- INI BARIS BARU YANG WAJIB DITAMBAHKAN
        }

      // ✅ Tampilkan notifikasi sukses
      setSuccessMessage(
        newStatus === 'active'
          ? 'Data berhasil diaktifkan!'
          : 'Data berhasil dinonaktifkan!'
      );
      setShowSuccess(true);

      // Tutup modal
      setShowModal(false);
      setItemId(null);
      setModalAction(null);
    } catch (error: any) {
      console.error('Gagal update status:', error);
      alert(error.message || 'Gagal mengubah status');
    }
  };

  const handleConfirm = () => {
    handleToggleStatus();
  };

  const handleCancel = () => {
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  };

  // Kolom tabel
  const columns = [
    { header: 'Nomor', key: 'nomor_urut', width: '100px', className: 'text-center', sortable: false},
    { header: 'Nama Variable', key: 'nama', width: '150px', sortable: true },
    { header: 'Bobot', key: 'bobot', width: '100px', className: 'text-center', sortable: false},
    { header: 'Deskripsi', key: 'deskripsi', width: '300px', sortable: true },
    { header: 'Referensi', key: 'referensi', width: '100px', sortable: true },
    {
      header: 'Logo UPPS/KC',
      key: 'logo',
      width: '80px',
      className: 'text-center',
      sortable: false,
    },
     ...(roleId === 1
    ? [
    {
      header: 'Aksi',
      key: 'action',
      width: '150px',
      className: 'text-center sticky right-0 z-10 bg-gray-100',
    },
  ]
  : [
     {
          header: 'Status',
          key: 'status',
          width: '150px',
          className: 'text-center sticky right-0 z-10 bg-white-100',
          sortable: false,
        },
  ]),
  ];

  // Data untuk export
  const dataForExport = currentData.map((item, index) => ({
    Nomor: item.nomor_urut,
    'Nama Variable': item.nama,
    Bobot: item.bobot,
    Deskripsi: item.deskripsi,
    Referensi: item.referensi,
    'Logo URL': item.logoUrl || '-',
    Aksi: item.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan',
  }));

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="rounded-lg overflow-hidden">
          
          {/* Notifikasi sukses — ✅ DIPERBAIKI */}
          <SuccessNotification
            isOpen={showSuccess}
            onClose={() => {
              setShowSuccess(false);
              setSuccessMessage(null);
            }}
            message={successMessage || "Variable baru berhasil ditambahkan!"}
          />

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg sm:w-64 bg-white">
                <SearchTable
                  value={search}
                  onChange={setSearch}
                  placeholder="Cari Transformation variable .."
                  className="mb-4"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <TableButton 
                  data={dataForExport}
                  columns={['Nomor', 'Nama Variable', 'Bobot','Deskripsi', 'Referensi', 'Logo URL', 'Aksi']}
                />
                {roleId === 1 && (
                <Button variant="primary" onClick={() => router.push('/transformation-variable/tambah-variable')}>
                   Tambah Variable
                </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabel */}
          {loading ? (
            <div className="p-10 text-center text-gray-500">Memuat data dari API...</div>
          ) : (
            <div className="overflow-x-auto">
             <TableUpdate
  columns={columns}
  data={currentData}
  currentPage={currentPage}
  rowsPerPage={rowsPerPage}
  onEdit={(item) => { 
    router.push(`/transformation-variable/edit/${item.id}`);
  }}
  onDeactivate={(index) => openConfirmModal(currentData[index].id, 'deactivate')}
  onReactivate={(index) => openConfirmModal(currentData[index].id, 'activate')}
  onSort={handleSort}
  sortConfig={sortConfig}
  renderCell={(columnKey, item) => {
    if (columnKey === 'status') {
      return (
        <RoleBasedStatusCell
          status={item.status}
          id={item.id}
          onEdit={(id) => router.push(`/transformation-variable/edit/${id}`)}
          onToggleStatus={(id, action) => {
            if (action === 'deactivate') {
              openConfirmModal(id, 'deactivate');
            } else {
              openConfirmModal(id, 'activate');
            }
          }}
        />
      );
    }
    return null; 
  }}
/>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalData}
            itemsPerPage={rowsPerPage}
            onItemsPerPageChange={setRowsPerPage}
            showItemsPerPage={true}
            showTotalItems={true}
          />
        </div>

        {/* Modal Konfirmasi */}
        {showModal && (
          <ModalConfirm
            isOpen={showModal}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            header={modalAction === 'deactivate' ? 'Aktifkan Data' : 'Nonaktifkan Data'}
            title={
              modalAction === 'deactivate'
                ? 'Apakah kamu yakin ingin mengaktifkan data ini?'
                : 'Apakah kamu yakin ingin menonaktifkan data ini?'
            }
            confirmLabel="Ya, lakukan"
            cancelLabel="Batal"
          >
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm flex items-start gap-3 mt-2">
              <LucideInfo size={20} className="mt-0.5 text-blue-500" />
              <div>
                <div className="font-semibold">Informasi</div>
                <div className="text-sm">
                  {modalAction === 'deactivate'
                    ? 'Kamu bisa menonaktifkan kembali data yang sudah diaktifkan.'
                    : 'Kamu bisa mengaktifkan kembali data yang sudah dinonaktifkan.'}
                </div>
              </div>
            </div>
          </ModalConfirm>
        )}
      </div>
    </div>
  );
}