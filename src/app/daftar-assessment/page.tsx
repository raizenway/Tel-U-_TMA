'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import SuccessNotification from '@/components/SuccessNotification';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import TableUpdate from '@/components/TableUpdate';
import { Search, Copy, Printer, ChevronDown, Info } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function AssessmentPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<'deactivate' | 'reactivate' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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
  const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);
  const indexOfLastItem = page * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
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

  // Export
  const handleCopy = () => {
    const text = currentData
      .map((item) => `${item.nomor}, ${item.variable}, ${item.bobot}, ${item.indikator}, ${item.pertanyaan}, ${item.status}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Data berhasil disalin ke clipboard');
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const csvContent = [
      ['Nomor', 'Nama Variable', 'Bobot', 'Indikator', 'Pertanyaan', 'Tipe Soal', 'Status'],
      ...currentData.map((item) => [
        item.nomor,
        `"${item.variable}"`,
        item.bobot,
        `"${item.indikator}"`,
        `"${item.pertanyaan}"`,
        `"${item.tipeSoal || '-'}"`,
        item.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'daftar_assessment.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="flex min-h-screen">
      <div className="p-5 bg-gray-100 flex-1">
        {/* Notifikasi */}
        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Assessment baru berhasil ditambahkan!"
        />

        {/* Modal Konfirmasi */}
        {showModal && (
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

        {/* Container dengan jarak yang benar */}
        <div
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mx-auto my-19"
          style={{ width: '1000px', minHeight: '650px' }}
        >
          {/* ✅ JARAK DITAMBAHKAN DI SINI: p-6 memberi ruang ke semua sisi */}
          <div className="p-6">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-gray mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-64 bg-white">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                  />
                </div>
                <div className="flex gap-2 flex-wrap bg-white">
                  <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy}>
                    Copy
                  </Button>
                  <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint}>
                    Print
                  </Button>
                  <Button variant="outline" icon={ChevronDown} iconPosition="right" onClick={handleDownload}>
                    Download
                  </Button>
                  <Button variant="primary" onClick={handleTambah}>
                    Tambah Assessment
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabel */}
            <TableUpdate
              columns={columns}
              data={currentData}
              currentPage={page}
              rowsPerPage={ITEMS_PER_PAGE}
              onEdit={(item) => router.push(`/daftar-assessment/edit-assessment/${item.nomor}`)}
              onDeactivate={(index) => toggleStatus(index)}
              onReactivate={(index) => toggleStatus(index)}
              onSort={handleSort}
              sortConfig={sortConfig}
            />

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm bg-gray-50 mt-6">
              <span>{currentData.length} Data ditampilkan</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
                >
                  {'<'}
                </button>
                <span className="font-medium bg-gray-150 w-8 h-8 flex items-center justify-center border rounded-full">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
                >
                  {'>'}
                </button>
              </div>
              <span>Total: {totalData}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}