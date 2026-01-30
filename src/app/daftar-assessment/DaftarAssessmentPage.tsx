'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import SuccessNotification from '@/components/SuccessNotification';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import SearchTable from '@/components/SearchTable';
import Pagination from '@/components/Pagination';
import { Info } from 'lucide-react';
import { useQuestionList, useUpdateQuestion } from '@/hooks/useDaftarAssessment';
import type { ApiResponse } from '@/interfaces/api-response';
import type { Question } from '@/interfaces/daftar-assessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';
// import RoleBasedStatusCell from "@/components/RoleBasedStatusCell"; // Di-hide karena tidak digunakan

export default function AssessmentPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuestionList();
  const [localData, setData] = useState<any[]>([]);
  const { data: variablesData, loading: loadingVariables } = useTransformationVariableList();
  const { mutate: updateQuestionMutate } = useUpdateQuestion();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'deactivate' | 'reactivate' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  // Ambil roleId dari localStorage
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

  // Buat variableNameMap
  const variableNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (Array.isArray(variablesData)) {
      variablesData.forEach((v) => {
        map[v.id] = v.name;
      });
    }
    return map;
  }, [variablesData]);

  // Load data soal
  useEffect(() => {
    const questionData = (data as unknown as ApiResponse<Question[]> | null)?.data || [];
    
    if (!loading && !error && Array.isArray(questionData) && Object.keys(variableNameMap).length > 0) {
      const dataWithNomor = questionData.map((item, index) => ({
        ...item,
        nomor: index + 1,
        variable: variableNameMap[item.transformationVariableId] || `ID ${item.transformationVariableId}`,
        indikator: item.indicator || '-',
        pertanyaan: item.questionText || '-',
        deskripsiSkor0: item.scoreDescription0 || '-',
        deskripsiSkor1: item.scoreDescription1 || '-',
        deskripsiSkor2: item.scoreDescription2 || '-',
        deskripsiSkor3: item.scoreDescription3 || '-',
        deskripsiSkor4: item.scoreDescription4 || '-',
        tipeSoal: 
          item.type === 'multitext' ? 'Pilihan Jawaban' :
          item.type === 'text' ? 'Pilihan Jawaban' :
          item.type === 'api' ? 'API dari iGracias' :
          item.type === 'excel' ? 'Submit Jawaban Excel' :
          'Tipe Tidak Dikenal',
        status: item.status,
      }));
      setData(dataWithNomor);
      setSearch('');

      if (localStorage.getItem('newDataAdded') === 'true') {
        setShowSuccess(true);
        localStorage.removeItem('newDataAdded');
      }
    }
  }, [data, loading, error, variableNameMap]);

  // Sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...localData].sort((a, b) => {
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

  // Filter & Pagination - Berdasarkan role
  const filteredData = useMemo(() => {
    let processedData = localData;

    // Filter non-aktif hanya untuk role 2, 3, 4
    if (roleId !== 1) {
      processedData = processedData.filter(item => item.status === 'active');
    }

    // Filter pencarian
    return processedData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [localData, search, roleId]);

  const totalData = filteredData.length;
  const totalPages = Math.ceil(totalData / itemsPerPage);
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle status
  const toggleStatus = (index: number) => {
    const globalIndex = indexOfFirstItem + index;
    setPendingToggleIndex(globalIndex);
    const nextStatus = localData[globalIndex].status === 'active' ? 'inactive' : 'active';
    setTargetStatus(nextStatus === 'active' ? 'reactivate' : 'deactivate');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (pendingToggleIndex === null) return;

    const globalIndex = pendingToggleIndex;
    const item = localData[globalIndex];
    const newStatus = item.status === 'active' ? 'inactive' : 'active';

    const updatedLocalData = [...localData];
    updatedLocalData[globalIndex] = { ...item, status: newStatus };
    setData(updatedLocalData);

    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);

    try {
      await updateQuestionMutate(item.id, { status: newStatus });
    } catch (err) {
      const revertedData = [...localData];
      revertedData[globalIndex] = item;
      setData(revertedData);
      console.error("Gagal update status:", err);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  const handleTambah = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment/tambah-assessment');
  };

  // ✅ Kolom tabel: Ditentukan berdasarkan roleId
  const columns = useMemo(() => {
    let baseColumns = [
      { header: 'Nomor', key: 'nomor', width: '100px', className: 'text-center', sortable: true },
      { header: 'Nama Variable', key: 'variable', width: '180px', sortable: true },
      { header: 'Indikator', key: 'indikator', width: '250px', sortable: false },
      { header: 'Pertanyaan', key: 'pertanyaan', width: '250px', sortable: false },
      { header: 'Deskripsi Skor 0', key: 'deskripsiSkor0', width: '200px', sortable: false },
      { header: 'Deskripsi Skor 1', key: 'deskripsiSkor1', width: '200px', sortable: false },
      { header: 'Deskripsi Skor 2', key: 'deskripsiSkor2', width: '200px', sortable: false },
      { header: 'Deskripsi Skor 3', key: 'deskripsiSkor3', width: '200px', sortable: false },
      { header: 'Deskripsi Skor 4', key: 'deskripsiSkor4', width: '200px', sortable: false },
    ];

    // Tambahkan kolom 'Tipe Soal' hanya jika roleId = 1
    if (roleId === 1) {
      baseColumns.push(
        { header: 'Tipe Soal', key: 'tipeSoal', width: '140px', className: 'text-center', sortable: true }
      );
    }

    if (roleId === 1) {
      // Super User: Tambahkan kolom Aksi
      return [
        ...baseColumns,
        {
          header: 'Aksi',
          key: 'action',
          width: '150px',
          className: 'text-center sticky right-0 z-10 bg-gray-100',
        },
      ];
    } else {
      // Role lain (2, 3, 4): Tidak ada kolom Status tambahan
      // Kolom 'Aksi' dihilangkan
      return baseColumns;
    }
  }, [roleId]); // Reaktif terhadap roleId

  if (loading || loadingVariables) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data assessment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <div>❌ {error}</div>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-full flex-1">
        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Assessment baru berhasil ditambahkan!"
        />

        {showModal && roleId === 1 && (
          <ModalConfirm
            isOpen={showModal}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            header={targetStatus === 'deactivate' ? 'Non Aktifkan Data' : 'Aktifkan Kembali Data'}
            title={
              targetStatus === 'deactivate'
                ? 'Apakah kamu yakin, kamu akan menonaktifkan data ini?'
                : 'Apakah kamu yakin, kamu akan mengaktifkan kembali data ini?'
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

        <div className="bg-white rounded-lg border-gray-200 overflow-hidden mx-auto">
          <div className="p-0">
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
                  {/* ✅ Tombol Tambah Assessment: Muncul untuk semua role */}
                  {roleId === 1 && (
                  <Button variant="primary" onClick={handleTambah}>
                    Tambah Assessment
                  </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {currentData.length > 0 ? (
                <TableUpdate
                  columns={columns}
                  data={currentData}
                  currentPage={page}
                  rowsPerPage={itemsPerPage}
                  onEdit={(item) => router.push(`/daftar-assessment/edit-assessment/${item.id}`)}
                  onDeactivate={(index) => toggleStatus(index)}
                  onReactivate={(index) => toggleStatus(index)}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                />
              ) : (
                <div className="p-6 text-center text-gray-500 border-t">
                  {/* ✅ Pesan kosong: Berbeda untuk Super User dan role lain */}
                  {roleId === 1 
                    ? 'Tidak ada data assessment untuk ditampilkan.' 
                    : 'Tidak ada data assessment aktif untuk ditampilkan.'}
                </div>
              )}
            </div>

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