'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import {
  Search,
  Copy,
  Printer,
  ChevronDown,
  Pencil,
  X,
  Check,
  Info as LucideInfo,
  Building,
} from 'lucide-react';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';

export default function AssessmentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const router = useRouter();
  const [tableData, setTableData] = useState<any[]>([]);

  // State untuk modal konfirmasi
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);

  // Fungsi: Toggle status Active ↔ Inactive
  const handleToggleStatus = (id: number) => {
    const saved = localStorage.getItem('transformationVariables');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const updated = parsed.map((item: any) =>
        item.id === id
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      );

      localStorage.setItem('transformationVariables', JSON.stringify(updated));
      loadTableData(); // Refresh tabel
    } catch (error) {
      console.error('Gagal update status:', error);
    }
  };

  // Fungsi: Buka modal konfirmasi
  const openConfirmModal = (id: number, action: 'activate' | 'deactivate') => {
    setItemId(id);
    setModalAction(action);
    setShowModal(true);
  };

  // Fungsi: Konfirmasi dari modal
  const handleConfirm = () => {
    if (itemId !== null) {
      handleToggleStatus(itemId);
    }
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  };

  // Fungsi: Batal dari modal
  const handleCancel = () => {
    setShowModal(false);
    setItemId(null);
    setModalAction(null);
  };

  // Fungsi: Baca dari localStorage & format untuk tabel
  const loadTableData = () => {
    const saved = localStorage.getItem('transformationVariables');
    if (!saved) {
      setTableData([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const formatted = parsed.map((item: any) => ({
        id: item.id,
        nama: item.namaVariabel || '-',
        variable: item.variable || '-',
        bobot: item.bobot || '-',
        pertanyaan: item.pertanyaan || '-',
        deskripsi: item.deskripsi || '-',
        referensi: item.referensi || '-',
        logoUrl: item.logoUrl || null, // Gunakan null agar fallback bekerja
        status: (
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${
              item.status === 'Active'
                ? 'bg-green-500'
                : item.status === 'Inactive'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          >
            {item.status}
          </span>
        ),
      }));

      setTableData(formatted);
    } catch (error) {
      console.error('Gagal parsing data:', error);
      setTableData([]);
    }
  };

  // Load data saat komponen mount
  useEffect(() => {
    loadTableData();
  }, []);

  // Fungsi: Copy
  const handleCopy = () => {
    const content = tableData
      .map((row) => [
        row.nama,
        row.variable,
        row.bobot,
        row.pertanyaan,
        row.deskripsi,
        row.referensi,
        row.status.props.children,
      ].join('\t'))
      .join('\n');

    navigator.clipboard.writeText(content)
      .then(() => alert('Data berhasil disalin!'))
      .catch(() => alert('Gagal menyalin.'));
  };

  // Fungsi: Print
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return alert('Pop-up diblokir.');

    const rows = tableData
      .map(
        (row) => `
      <tr>
        <td>${row.nama}</td>
        <td>${row.bobot}</td>
        <td>${row.pertanyaan}</td>
        <td>${row.deskripsi}</td>
        <td>${row.referensi}</td>
        <td>${row.status.props.children}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head><title>Print Assessment</title></head>
        <body>
          <h2>Daftar Assessment</h2>
          <table border="1" cellpadding="5">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Bobot</th>
                <th>Pertanyaan</th>
                <th>Deskripsi</th>
                <th>Referensi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Fungsi: Download CSV
  const handleDownload = () => {
    const headers = 'Nama,Variable,Bobot,Pertanyaan,Deskripsi,Referensi,Status';
    const rows = tableData
      .map((row) => [
        `"${row.nama}"`,
        `"${row.variable}"`,
        `"${row.bobot}"`,
        `"${row.pertanyaan}"`,
        `"${row.deskripsi}"`,
        `"${row.referensi}"`,
        `"${row.status.props.children}"`,
      ].join(','))
      .join('\n');

    const csv = [headers, rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `assessment-data-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  // Pagination
  const totalData = tableData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + rowsPerPage);

  const handleTambah = () => {
    localStorage.removeItem('editData');
    router.push('/transformation-variable/tambah-variable');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border mx-auto w-full max-w-6xl mt-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white shadow-sm w-80">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari..."
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
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
            Tambah Variable
          </Button>
        </div>
      </div>

      {/* Tabel */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 uppercase">
              <th className="px-4 py-3 text-center border border-gray-300" style={{ width: '80px', minWidth: '80px' }}>
                Nomor
              </th>
              <th className="px-4 py-3 border border-gray-300" style={{ width: '150px', minWidth: '150px' }}>
                Nama Variable
              </th>
              <th className="px-4 py-3 text-center border border-gray-300" style={{ width: '80px', minWidth: '80px' }}>
                Bobot
              </th>
              <th className="px-4 py-3 border border-gray-300" style={{ width: '250px', minWidth: '250px' }}>
                Pertanyaan
              </th>
              <th className="px-4 py-3 border border-gray-300" style={{ width: '300px', minWidth: '300px' }}>
                Deskripsi
              </th>
              <th className="px-4 py-3 border border-gray-300" style={{ width: '180px', minWidth: '180px' }}>
                Referensi
              </th>
              <th className="px-4 py-3 text-center border border-gray-300" style={{ width: '80px', minWidth: '80px' }}>
                Logo UPPS/KC
              </th>
              <th
                className="sticky right-0 bg-gray-100 z-10 border border-gray-100 text-center whitespace-nowrap"
                style={{ width: '150px', minWidth: '150px' }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center border border-gray-200">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 border border-gray-200">{row.nama}</td>
                  <td className="px-4 py-3 text-center border border-gray-200">{row.bobot}</td>
                  <td className="px-4 py-3 border border-gray-200">{row.pertanyaan}</td>
                  <td className="px-4 py-3 border border-gray-200">{row.deskripsi}</td>
                  <td className="px-4 py-3 border border-gray-200">{row.referensi}</td>
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="flex items-center justify-center">
                      {row.logoUrl ? (
                        <img
                          src={row.logoUrl}
                          alt="Logo"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                          <Building size={16} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    className="sticky right-0 bg-white z-10 border border-gray-200 text-center whitespace-nowrap shadow-sm"
                    style={{ boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}
                  >
                    <div className="flex justify-center gap-2 px-2 py-1">
                      <button
                        className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                        onClick={() => {
                          localStorage.setItem('editData', JSON.stringify(tableData[startIndex + index]));
                          router.push('/transformation-variable/tambah-variable');
                        }}
                      >
                        <Pencil size={14} className="mr-1" /> Edit
                      </button>
                      <button
                        className={`flex items-center gap-1 text-xs font-medium ${
                          row.status.props.children === 'Active'
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        onClick={() => {
                          if (row.status.props.children === 'Active') {
                            openConfirmModal(row.id, 'deactivate');
                          } else {
                            openConfirmModal(row.id, 'activate');
                          }
                        }}
                      >
                        {row.status.props.children === 'Active' ? (
                          <>
                            <X size={14} className="mr-1" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Check size={14} className="mr-1" /> Reactivate
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 border-t">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔢 Pagination Lengkap (Inline) */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm bg-gray-50">
        <span>{currentData.length} Data ditampilkan</span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman sebelumnya"
          >
            {'<'}
          </button>
          <span className="font-medium bg-white w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman berikutnya"
          >
            {'>'}
          </button>
        </div>

        <span>Total: {totalData}</span>
      </div>

      {/* 🔔 Modal Konfirmasi */}
      {showModal && (
        <ModalConfirm
          isOpen={showModal}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          header={
            modalAction === 'deactivate'
              ? 'Non Aktifkan Data'
              : 'Aktifkan Kembali Data'
          }
          title={
            modalAction === 'deactivate'
              ? 'Apakah kamu yakin, kamu akan menonaktifkan data ini?'
              : 'Apakah kamu yakin, kamu akan mengaktifkan kembali data ini?'
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
                  ? 'Kamu bisa mengembalikan kembali data yang sudah dinonaktifkan.'
                  : 'Kamu bisa menampilkan kembali data yang sudah diaktifkan.'}
              </div>
            </div>
          </div>
        </ModalConfirm>
      )}
    </div>
  );
}