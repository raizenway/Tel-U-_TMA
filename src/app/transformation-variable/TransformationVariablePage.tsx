'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Eye as LucideEye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
// import RoleBasedStatusCell from '@/components/RoleBasedStatusCell'; // Di-hide karena tidak digunakan

type TableItem = {
  id: number;
  nama: string;
  bobot: string | number;
  deskripsi: string;
  levelDescription1?: string;
  levelDescription2?: string;
  levelDescription3?: string;
  levelDescription4?: string;
  referensi: string;
  LogoUrl: string;
  status: string; // 'Active' atau 'Inactive'
  nomor_urut: number;
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
    key: 'name',
    direction: 'asc',
  });

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);

  const openDescriptionModal = (item: TableItem) => {
    setSelectedItem(item);
    setShowDescriptionModal(true);
  };

  const searchParams = useSearchParams();
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

  // Ambil data
  const { data, loading, error, refetch } = useTransformationVariableList();
  const { mutate: updateVariable, loading: updating } = useUpdateTransformationVariable();

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded">
        {error}
      </div>
    );
  }

  // ✅ Proses data dan sesuaikan status
  const tableData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      // Ambil field dengan fallback aman
      const id = item.id ?? 0;
      const name = item.name ?? '-';
      const weight = item.weight != null ? String(item.weight) : '-';
      const description = item.description ?? '-';
      const levelDescription1 = item.levelDescription1 ?? '-';
      const levelDescription2 = item.levelDescription2 ?? '-';
      const levelDescription3 = item.levelDescription3 ?? '-';
      const levelDescription4 = item.levelDescription4 ?? '-';
      const reference = item.reference ?? '-';
      // Konversi status API ('active'/'inactive') ke tampilan ('Active'/'Inactive')
      const status = item.status === 'active' ? 'Active' : 'Inactive';

      return {
        id,
        nama: name,
        bobot: weight,
        deskripsi: description,
        levelDescription1,
        levelDescription2,
        levelDescription3,
        levelDescription4,
        referensi: reference,
        LogoUrl: '',
        status, // 'Active' atau 'Inactive'
      };
    });
  }, [data]);

  // Sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Reset jika klik lagi
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof TableItem];
      let bVal = b[sortConfig.key as keyof TableItem];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  // Filter & Hide non-active items for non-Super Users
  const filteredData = useMemo(() => {
    let processedData = sortedData;

    // Filter non-aktif hanya jika bukan Super User (roleId !== 1)
    if (roleId !== 1) {
      processedData = processedData.filter(item => item.status === 'Active');
    }

    // Filter pencarian
    return processedData.filter((item) =>
      Object.values(item).some((val) => {
        if (val == null) return false; // skip null/undefined
        return String(val).toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [sortedData, search, roleId]);

  // Pagination
  const totalData = filteredData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = useMemo(() => {
    return filteredData
      .slice(startIndex, startIndex + rowsPerPage)
      .map((item, index): TableItem => ({
        ...item,
        nomor_urut: startIndex + index + 1,
      }));
  }, [filteredData, startIndex]);

  // modal
  const openConfirmModal = (id: number, action: 'activate' | 'deactivate') => {
    setItemId(id);
    setModalAction(action);
    setShowModal(true);
  };

  // HOOK UPDATE
  const handleToggleStatus = async () => {
    if (itemId === null || !data || !Array.isArray(data)) return;

    const currentItem = data.find(item => item.id === itemId);
    if (!currentItem) {
      console.warn("Item tidak ditemukan:", itemId);
      return;
    }

    try {
      const newStatus = currentItem.status === 'active' ? 'inactive' : 'active';

      // hook
      await updateVariable(itemId, {
        name: currentItem.name,
        weight: currentItem.weight,
        description: currentItem.description,
        levelDescription1: currentItem.levelDescription1,
        levelDescription2: currentItem.levelDescription2,
        levelDescription3: currentItem.levelDescription3,
        levelDescription4: currentItem.levelDescription4,
        reference: currentItem.reference,
        sortOrder: currentItem.sortOrder,
        status: newStatus,
      });

      await refetch();

      if (sortConfig) {
        setSortConfig({ ...sortConfig });
      }

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

  // Kolom tabel - Ditentukan berdasarkan roleId
  const columns = useMemo(() => {
    let baseColumns = [
      {
        header: 'Nomor',
        key: 'nomor_urut',
        width: '100px',
        className: 'text-center',
        sortable: false
      },
      {
        header: 'Nama Variable',
        key: 'nama',
        width: '150px',
        sortable: true
      },
      {
        header: 'Bobot',
        key: 'bobot',
        width: '100px',
        className: 'text-center',
        sortable: false
      },
      {
        header: 'Deskripsi',
        key: 'deskripsi',
        width: '300px',
        sortable: true
      },
      {
        header: 'Level Deskripsi',
        key: 'viewdescription',
        width: '150px',
        className: 'text-center',
        sortable: false,
        renderCell: (item: TableItem) => (
          <button
            onClick={() => openDescriptionModal(item)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
            title="Lihat Deskripsi Level"
          >
            <LucideEye size={16} />
            Lihat Deskripsi
          </button>
        ),
      },
      {
        header: 'Referensi',
        key: 'referensi',
        width: '100px',
        sortable: true
      },
      {
        header: 'Logo UPPS/KC',
        key: 'logo',
        width: '80px',
        className: 'text-center',
        sortable: false,
        renderCell: (item: TableItem) =>
          item.LogoUrl ? (
            <img
              src={item.LogoUrl}
              alt="Logo"
              className="w-8 h-8 object-contain mx-auto"
            />
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
    ];

    // Tambahkan kolom "Aksi" hanya jika roleId = 1
    if (roleId === 1) {
      baseColumns.push(
        {
          header: 'Aksi',
          key: 'action',
          width: '150px',
          className: 'text-center sticky right-0 z-10 bg-gray-100',
          sortable: false, // Kolom Aksi umumnya tidak bisa diurutkan
        }
      );
    }
    // Jika roleId bukan 1, tidak tambahkan kolom "Status" atau "Aksi" tambahan

    return baseColumns;
  }, [roleId]); // Reaktif terhadap roleId

  // Data untuk export
  const dataForExport = currentData.map((item) => ({
    Nomor: item.nomor_urut,
    'Nama Variable': item.nama,
    Bobot: item.bobot,
    Deskripsi: item.deskripsi,
    'Level Description1': item.levelDescription1,
    'Level Description2': item.levelDescription2,
    'Level Description3': item.levelDescription3,
    'Level Description4': item.levelDescription4,
    Referensi: item.referensi,
    'Logo Url': item.LogoUrl || '-',
    Aksi: item.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan',
  }));

  // Debug logs
  console.log("=== DEBUG ===");
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Data:", data);
  console.log("TableData length:", tableData.length);
  console.log("FilteredData length:", filteredData.length);
  console.log("CurrentData length:", currentData.length);

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="rounded-lg overflow-hidden">

          {/* Notifikasi sukses */}
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
                  columns={['Nomor', 'Nama Variable', 'Bobot', 'Deskripsi', 'Level Description1', 'Level Description2', 'Level Description3', 'Level Description4', 'Referensi', 'Logo URL', 'Aksi']}
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

        <ModalConfirm
          isOpen={showDescriptionModal}
          onCancel={() => {
            setShowDescriptionModal(false);
            setSelectedItem(null);
          }}
          header="Level Deskripsi"
          title=""
          footer={
            <div className="w-full flex justify-center mt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setShowDescriptionModal(false);
                  setSelectedItem(null);
                }}
                className="px-10 py-2 rounded-md"
              >
                Tutup
              </Button>
            </div>
          }
        >
          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Very Low Maturity</h4>
                <p className="text-sm text-gray-700">{selectedItem.levelDescription1 || '-'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Low Maturity</h4>
                <p className="text-sm text-gray-700">{selectedItem.levelDescription2 || '-'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Medium Maturity</h4>
                <p className="text-sm text-gray-700">{selectedItem.levelDescription3 || '-'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">High Maturity</h4>
                <p className="text-sm text-gray-700">{selectedItem.levelDescription4 || '-'}</p>
              </div>
            </div>
          )}
        </ModalConfirm>
      </div>
    </div>
  );
}