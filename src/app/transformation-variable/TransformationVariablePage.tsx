'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import TableUpdate from '@/components/TableUpdate';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
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
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [itemId, setItemId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // 🔹 Load data dari localStorage
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
        logoUrl: item.logoUrl || null,
        status: item.status === 'Active' || item.status === 'active' ? 'Active' : 'Inactive',
      }));
      setTableData(formatted);
    } catch (error) {
      console.error('Gagal parsing ', error);
      setTableData([]);
    }
  };

  useEffect(() => {
    loadTableData();

    if (localStorage.getItem('newDataAdded') === 'true') {
      setShowSuccess(true);
      localStorage.removeItem('newDataAdded');
    }
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
  const handleToggleStatus = () => {
    if (itemId === null) return;

    const saved = localStorage.getItem('transformationVariables');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const updated = parsed.map((item: any) =>
        item.id === itemId
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      );
      localStorage.setItem('transformationVariables', JSON.stringify(updated));
      loadTableData(); // Refresh UI
    } catch (error) {
      console.error('Gagal update status:', error);
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

  // 🔹 Ekspor
  const handleCopy = () => {
    const content = currentData
      .map((row) => [row.nama, row.variable, row.bobot, row.pertanyaan, row.deskripsi, row.referensi, row.status].join('\t'))
      .join('\n');
    navigator.clipboard.writeText(content)
      .then(() => alert('Data berhasil disalin!'))
      .catch(() => alert('Gagal menyalin.'));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return alert('Pop-up diblokir.');
    const rows = currentData
      .map(row => `
        <tr>
          <td>${row.nama}</td>
          <td>${row.bobot}</td>
          <td>${row.pertanyaan}</td>
          <td>${row.deskripsi}</td>
          <td>${row.referensi}</td>
          <td>${row.status}</td>
        </tr>
      `).join('');
    printWindow.document.write(`
      <html>
        <head><title>Print Assessment</title></head>
        <body>
          <h2>Daftar Assessment</h2>
          <table border="1">${rows}</table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const headers = 'Nama,Variable,Bobot,Pertanyaan,Deskripsi,Referensi,Status';
    const rows = currentData
      .map(row => [
        `"${row.nama}"`,
        `"${row.variable}"`,
        `"${row.bobot}"`,
        `"${row.pertanyaan}"`,
        `"${row.deskripsi}"`,
        `"${row.referensi}"`,
        `"${row.status === 'Active' ? 'Active' : 'Inactive'}"`
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

  return (
    <div className="flex min-h-screen">
      {/* Container utama: penuh layar */}
      <div className="flex-1">
        <div className=" rounded-lg shadow-md border overflow-hidden">
          
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
                <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy}>
                  Copy
                </Button>
                <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint}>
                  Print
                </Button>
                <Button variant="outline" icon={ChevronDown} iconPosition="right" onClick={handleDownload}>
                  Download
                </Button>
                <Button variant="primary" onClick={() => router.push('/transformation-variable/tambah-variable')}>
                  Tambah Variable
                </Button>
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <TableUpdate
              columns={columns}
              data={currentData.map((item, index) => ({
                ...item,
                nomor: startIndex + index + 1,
                logo: (
                  <div className="flex items-center justify-center">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <Building size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                ),
              }))}
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
