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
import { useQuestionList } from '@/hooks/useDaftarAssessment';
import type { ApiResponse } from '@/interfaces/api-response';
import type { Question } from '@/interfaces/daftar-assessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';
import { useCreateAssessmentDetail } from '@/hooks/useAssessment';

export default function AssessmentPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuestionList();
  const questionData = (data as unknown as ApiResponse<Question[]> | null)?.data || [];
  const [localData, setData] = useState<any[]>([]);
  const [variableMap, setVariableMap] = useState<Record<number, string>>({}); // ✅ State untuk mapping variabel
  const { data: variablesData, loading: loadingVariables } = useTransformationVariableList();
   const { mutate: saveAnswer, loading: saving, error: saveError } = useCreateAssessmentDetail();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'deactivate' | 'reactivate' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  // ✅ Load variableMap dari API
  useEffect(() => {
    if (variablesData) {
      const map: Record<number, string> = {};
      variablesData.forEach((variable: any) => {
        map[variable.id] = variable.name; // Sesuaikan field jika perlu
      });
      setVariableMap(map);
    }
  }, [variablesData]);

  // ✅ Load data soal — tunggu variableMap siap
  useEffect(() => {
    if (!loading && !error && questionData && Array.isArray(questionData) && Object.keys(variableMap).length > 0) {
      const dataWithNomor = questionData.map((item, index) => ({
        ...item,
        nomor: index + 1,
        // ✅ Ambil nama variabel dari API transformationVariable
        variable: variableMap[item.transformationVariableId] || `Variable ${item.transformationVariableId}`,
        indikator: item.indicator || '-',
        pertanyaan: item.questionText || '-',
        deskripsiSkor0: item.scoreDescription0 || '-',
        deskripsiSkor1: item.scoreDescription1 || '-',
        deskripsiSkor2: item.scoreDescription2 || '-',
        deskripsiSkor3: item.scoreDescription3 || '-',
        deskripsiSkor4: item.scoreDescription4 || '-',
        tipeSoal: item.type === 'multitext' ? 'Pilihan Jawaban' : 'Lainnya',
        status: item.status,
      }));
      setData(dataWithNomor);
      setSearch('');
      console.log("✅ localData berhasil di-set:", dataWithNomor);

      if (localStorage.getItem('newDataAdded') === 'true') {
        setShowSuccess(true);
        localStorage.removeItem('newDataAdded');
      }
    }
  }, [questionData, loading, error, variableMap]);

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

  // Filter
  const filteredData = localData.filter((item) =>
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
    const nextStatus = localData[globalIndex].status === 'active' ? 'inactive' : 'active';
    setTargetStatus(nextStatus === 'active' ? 'reactivate' : 'deactivate');
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (pendingToggleIndex !== null) {
      const updated = [...localData];
      updated[pendingToggleIndex].status =
        updated[pendingToggleIndex].status === 'active' ? 'inactive' : 'active';
      setData(updated);
    }
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingToggleIndex(null);
    setTargetStatus(null);
  };

  const handleTambah = () => {
    router.push('/daftar-assessment/tambah-assessment');
  };

  // Kolom tabel — termasuk render aksi
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
      render: (item: any, index: number) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              if (roleId === 1) {
                router.push(`/daftar-assessment/edit-assessment/${item.id}`);
              } else {
                alert("❌ Hanya admin yang bisa edit data.");
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Edit
          </button>
          {item.status === 'active' ? (
            <button
              onClick={() => {
                if (roleId === 1) {
                  toggleStatus(index);
                } else {
                  alert("❌ Hanya admin yang bisa nonaktifkan data.");
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Nonaktifkan
            </button>
          ) : (
            <button
              onClick={() => {
                if (roleId === 1) {
                  toggleStatus(index);
                } else {
                  alert("❌ Hanya admin yang bisa aktifkan data.");
                }
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Aktifkan
            </button>
          )}
        </div>
      ),
    },
  ];

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
                  onEdit={(item) => {
                    if (roleId === 1) {
                      router.push(`/daftar-assessment/edit-assessment/${item.id}`);
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
              ) : (
                <div className="p-6 text-center text-gray-500 border-t">
                  {loading ? "Loading..." : "Tidak ada data assessment untuk ditampilkan."}
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