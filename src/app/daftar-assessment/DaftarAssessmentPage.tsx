'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import SuccessNotification from '@/components/SuccessNotification';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import SearchTable from '@/components/SearchTable';
import Pagination from '@/components/Pagination';
import { Info } from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'deactivate' | 'reactivate' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('assessmentList');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      const dummyData = Array.from({ length: 100 }, (_, i) => ({
        nomor: i + 1,
        variable: i % 2 === 0 ? 'V1 (Mutu)' : 'V4 (Sarana & Prasarana)',
        bobot: i % 5 + 1,
        indikator: 'Contoh indikator...',
        pertanyaan: 'Contoh pertanyaan...',
        deskripsiSkor0: 'Tidak ada dokumentasi.',
        deskripsiSkor1: 'Ada dokumentasi dasar.',
        deskripsiSkor2: 'Dokumentasi sebagian lengkap.',
        deskripsiSkor3: 'Dokumentasi hampir lengkap.',
        deskripsiSkor4: 'Dokumentasi lengkap dan terupdate.',
        tipeSoal: ['Pilihan Jawaban', 'API dari iGracias', 'Submit Jawaban Excel'][i % 3],
        status: i % 3 === 0 ? 'Inactive' : 'Active',
      }));
      setData(dummyData);
    }

    if (localStorage.getItem('newDataAdded') === 'true') {
      setShowSuccess(true);
      localStorage.removeItem('newDataAdded');
    }
  }, []);

  // Sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...data].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setData(sorted);
  };

  // Filter
  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalData = filteredData.length;
  const totalPages = Math.ceil(totalData / itemsPerPage);
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle status
  const toggleStatus = (index: number) => {
    const globalIndex = indexOfFirstItem + index;
    setPendingToggleIndex(globalIndex);
    const nextStatus = data[globalIndex].status === 'Active' ? 'Inactive' : 'Active';
    setTargetStatus(nextStatus === 'Active' ? 'reactivate' : 'deactivate');
    setShowModal(true);
  };

  // Confirm
  const handleConfirm = () => {
    if (pendingToggleIndex !== null) {
      const updated = [...data];
      updated[pendingToggleIndex].status =
        updated[pendingToggleIndex].status === 'Active' ? 'Inactive' : 'Active';
      setData(updated);
      localStorage.setItem('assessmentList', JSON.stringify(updated));
    }
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  // Cancel
  const handleCancel = () => {
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  const handleTambah = () => {
    router.push('/daftar-assessment/tambah-assessment');
  };

  // Columns
  const columns = [
    { header: 'Nomor', key: 'nomor', width: '100px', className: 'text-center', sortable: true },
    { header: 'Nama Variable', key: 'variable', width: '180px', sortable: true },
    { header: 'Indikator', key: 'indikator', width: '250px' },
    { header: 'Pertanyaan', key: 'pertanyaan', width: '250px' },
    { header: 'Deskripsi Skor 0', key: 'deskripsiSkor0', width: '200px' },
    { header: 'Deskripsi Skor 1', key: 'deskripsiSkor1', width: '200px' },
    { header: 'Deskripsi Skor 2', key: 'deskripsiSkor2', width: '200px' },
    { header: 'Deskripsi Skor 3', key: 'deskripsiSkor3', width: '200px' },
    { header: 'Deskripsi Skor 4', key: 'deskripsiSkor4', width: '200px' },
    { header: 'Tipe Soal', key: 'tipeSoal', width: '140px', className: 'text-center', sortable: true },
    {
      header: 'Aksi',
      key: 'action',
      width: '200px',
      className: 'text-center sticky right-0 bg-gray-100 z-10',
    },
  ];

  return (
    <div className="flex">
      <div className="w-full flex-1">
        {/* Notifikasi */}
        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Assessment baru berhasil ditambahkan!"
        />

        {/* Modal Konfirmasi */}
        {showModal && roleId === 1 && (
          <ModalConfirm
            isOpen={showModal}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            header={targetStatus === 'deactivate' ? 'Non Aktifkan Data' : 'Aktifkan Kembali Data'}
            title={
              targetStatus === 'deactivate'
                ? 'Apakah kamu yakin, kamu akan mengaktifkan kembali data ini? '
                : 'Apakah kamu yakin, kamu akan menonaktifkan data ini?'
            }
            confirmLabel="Ya, lakukan"
            cancelLabel="Batal"
          >
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm flex items-start gap-3 mt-2">
              <Info size={20} className="mt-0.5 text-blue-500" />
              <div>
                <div className="font-semibold">Informasi</div>
                <div className="text-sm">
                  {targetStatus === 'deactivate'
                    ? 'Kamu bisa mengembalikan kembali data yang sudah dihilangkan.'
                    : 'Kamu bisa menampilkan kembali data yang sudah disembunyikan.'}
                </div>
              </div>
            </div>
          </ModalConfirm>
        )}

        {/* Container Utama */}
        <div className="bg-white rounded-lg border-gray-200 overflow-hidden mx-auto">
          <div className="p-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg sm:w-64 bg-white">
                  <SearchTable
                    value={search}
                    onChange={setSearch}
                    placeholder="Cari Daftar Assesment..."
                    className="mb-4"
                  />
                </div>
                <div className="flex gap-2 flex-wrap bg-white">
                  <TableButton data={currentData} />
                  {/* 🔹 Tombol Tambah hanya muncul untuk admin */}
                  {roleId === 1 && (
                    <Button variant="primary" onClick={handleTambah}>
                      Tambah Assessment
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
             <TableUpdate
  columns={columns}
  data={currentData}
  currentPage={page}
  rowsPerPage={itemsPerPage}
  onEdit={(item) => {
    if (roleId === 1) {
      router.push(`/daftar-assessment/edit-assessment/${item.nomor}`);
    } else {
      alert("❌ Hanya admin yang bisa edit data.");
    }
  }}
  onDeactivate={(index) => {
    if (roleId === 1) {
      toggleStatus(index);
    } else {
      alert("❌ Hanya admin yang bisa nonaktifkan data.");
    }
  }}
  onReactivate={(index) => {
    if (roleId === 1) {
      toggleStatus(index);
    } else {
      alert("❌ Hanya admin yang bisa aktifkan data.");
    }
  }}
  onSort={handleSort}
  sortConfig={sortConfig}
/>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalData}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showItemsPerPage={true}
              showTotalItems={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
