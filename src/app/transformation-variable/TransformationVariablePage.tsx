'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import TableUpdate from '@/components/TableUpdate';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import TableButton from '@/components/TableButton';
import {
  Search,
  Copy,
  Printer,
  ChevronDown,
  Building,
  Info as LucideInfo,
} from 'lucide-react';
import SuccessNotification from '@/components/SuccessNotification';

export default function AssessmentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const router = useRouter();
  const [tableData, setTableData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

const dataDummy: any = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe@mail.com",
    role: "Admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "janesmith@mail.com",
    role: "User",
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michaelj@mail.com",
    role: "Moderator",
  },
];


  // 🔹 Load data dari localStorage
  // 🔹 Load data dari API
const loadTableData = async () => {
  setLoading(true);
  try {
    const res = await fetch('http://localhost:3000/api/assessment/variable', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache',
    });

    if (!res.ok) throw new Error(`Gagal ambil data: ${res.status}`);

    const data = await res.json();

    const formatted = data.map((item: any) => ({
      id: item.id,
      nama: item.name || '-',
      variable: '-',
      bobot: item.weight || '-',
      pertanyaan: '-',
      deskripsi: item.description || '-',
      referensi: item.reference || '-',
      logoUrl: null,
      status: item.status === 'active' ? 'Active' : 'Inactive',
    }));

    setTableData(formatted);
  } catch (error) {
    console.error('Gagal ambil data dari API:', error);
    setTableData([]);
    alert('Tidak bisa terhubung ke server.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const fetchData = async () => {
    await loadTableData();

    if (localStorage.getItem('newDataAdded') === 'true') {
      setShowSuccess(true);
      localStorage.removeItem('newDataAdded');
    }
  };

  fetchData();
}, []);

  // 🔹 Sorting
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

  // 🔹 Urutkan data
  const sortedData = React.useMemo(() => {
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

  // 🔹 Filter
  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  // 🔹 Pagination
  const totalData = filteredData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // 🔹 Buka modal
  const openConfirmModal = (id: number, action: 'activate' | 'deactivate') => {
    setItemId(id);
    setModalAction(action);
    setShowModal(true);
  };

  // 🔹 Toggle status
  // 🔹 Toggle status via API
const handleToggleStatus = async () => {
  if (itemId === null) return;

  try {
    const currentItem = tableData.find(item => item.id === itemId);
    const newStatus = currentItem?.status === 'Active' ? 'Inactive' : 'Active';

    const res = await fetch(`http://localhost:3000/api/assessment/variable/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Update gagal');
    }

    // Refresh data dari API
    await loadTableData();
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  } catch (error: any) {
    console.error('Gagal update status:', error);
    alert(error.message || 'Gagal mengubah status');
  }
};

  // 🔹 Konfirmasi
  const handleConfirm = () => {
    handleToggleStatus();
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  };


  // 🔹 Kolom
  const columns = [
    { header: 'Nomor', key: 'nomor', width: '100px', className: 'text-center', sortable: true },
    { header: 'Nama Variable', key: 'nama', width: '150px', sortable: true },
    { header: 'Bobot', key: 'bobot', width: '100px', className: 'text-center', sortable: true },
    { header: 'Pertanyaan', key: 'pertanyaan', width: '250px', sortable: true },
    { header: 'Deskripsi', key: 'deskripsi', width: '300px', sortable: true },
    { header: 'Referensi', key: 'referensi', width: '100px', sortable: true },
    {
      header: 'Logo UPPS/KC',
      key: 'logo',
      width: '80px',
      className: 'text-center',
      sortable: false,
    },
    {
      header: 'Aksi',
      key: 'action',
      width: '150px',
      className: 'text-center sticky right-0 z-10 bg-gray-100',
    },
  ];

  const dataForExport = currentData.map((item, index) => ({
  Nomor: startIndex + index + 1,
  'Nama Variable': item.nama,
  Variable: item.variable,
  Bobot: item.bobot,
  Pertanyaan: item.pertanyaan,
  Deskripsi: item.deskripsi,
  Referensi: item.referensi,
  'Logo URL': item.logoUrl || '-',
  Aksi: item.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'
}));

  return (
    <div className="flex">
      {/* Container utama: penuh layar */}
      <div className="flex-1">
        <div className=" rounded-lg overflow-hidden">
          
          {/* Notifikasi */}
          <SuccessNotification
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            message="Variable baru berhasil ditambahkan!"
          />

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200  ">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-64 bg-white">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <TableButton 
                  data={dataForExport}
                  columns={['Nomor', 'Nama Variable', 'Variable', 'Bobot', 'Pertanyaan', 'Deskripsi', 'Referensi', 'Logo URL', 'Aksi']}
                />
                <Button variant="primary" onClick={() => router.push('/transformation-variable/tambah-variable')}>
                  Tambah Variable
                </Button>
              </div>
            </div>
          </div>

         {loading ? (
  <div className="p-10 text-center text-gray-500">Memuat data...</div>
) : (
  <div className="overflow-x-auto">
    <TableUpdate
      columns={columns}
      data={currentData}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onEdit={(item) => {
        const { logo, ...safeItem } = item;
        localStorage.setItem('editData', JSON.stringify(safeItem));
        router.push('/transformation-variable/tambah-variable');
      }}
      onDeactivate={(index) => openConfirmModal(currentData[index].id, 'deactivate')}
      onReactivate={(index) => openConfirmModal(currentData[index].id, 'activate')}
      onSort={handleSort}
      sortConfig={sortConfig}
    />
  </div>
)}

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm bg-gray-50">
            <span>{currentData.length} Data ditampilkan</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                {'<'}
              </button>
              <span className="font-medium bg-white w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
              >
                {'>'}
              </button>
            </div>
            <span>Total: {totalData}</span>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <ModalConfirm
            isOpen={showModal}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            header={modalAction === 'deactivate' ? 'Non Aktifkan Data' : 'Aktifkan Data'}
            title={
              modalAction === 'deactivate'
                ? 'Apakah kamu yakin ingin mengaktifkan data ini?'
                : 'Apakah kamu yakin ingin menonaktifkan data ini? '
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
