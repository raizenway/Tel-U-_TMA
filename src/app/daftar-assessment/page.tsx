  // app/daftar-assessment/page.tsx
  'use client';

  import React, { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { Pencil, X, Check, Info,  } from 'lucide-react';
  import Button from '@/components/button';
  import SuccessNotification from '@/components/SuccessNotification'; // ✅ Import notifikasi
  import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
  const ITEMS_PER_PAGE = 10;

  export default function AssessmentPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<null | { index: number; mode: 'deactivate' | 'reactivate' }>(null);
    const [showSuccess, setShowSuccess] = useState(false); // ✅ State untuk notifikasi

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
    // ✅ Flatten
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

      // 🔔 Cek apakah ada data baru ditambahkan
      if (localStorage.getItem('newDataAdded') === 'true') {
        setShowSuccess(true);
        localStorage.removeItem('newDataAdded'); // Hanya tampilkan sekali
      }
    }, []);

    // Kolom Tabel
    const columns = [
      { header: 'Nomor', key: 'nomor', width: '60px', className: 'text-center' },
      { header: 'Nama Variable', key: 'variable', width: '180px' },
      { header: 'Indikator', key: 'indikator', width: '250px' },
      { header: 'Pertanyaan', key: 'pertanyaan', width: '250px' },
      { header: 'Deskripsi Skor 0', key: 'deskripsiSkor0', width: '200px' },
      { header: 'Deskripsi Skor 1', key: 'deskripsiSkor1', width: '200px' },
      { header: 'Deskripsi Skor 2', key: 'deskripsiSkor2', width: '200px' },
      { header: 'Deskripsi Skor 3', key: 'deskripsiSkor3', width: '200px' },
      { header: 'Deskripsi Skor 4', key: 'deskripsiSkor4', width: '200px' },
      { header: 'Tipe Soal', key: 'tipeSoal', width: '140px', className: 'text-center' },
      {
        header: 'Aksi',
        key: 'action',
        width: '200px',
        className: 'text-center sticky right-0 border border-gray-200 z-10 bg-gray-100',
      },
    ];

    // Filter data
    const filteredData = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );

    const totalData = filteredData.length;
    const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Konfirmasi ubah status
    const confirmStatusChange = () => {
      if (!modal) return;
      const globalIndex = startIndex + modal.index;
      const updated = [...data];
      updated[globalIndex].status = updated[globalIndex].status === 'Active' ? 'Inactive' : 'Active';
      setData(updated);
      localStorage.setItem('assessmentList', JSON.stringify(updated));
      setModal(null);
    };

    // Fungsi Ekspor
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

    return (
      <div className="flex min-h-screen">
          {/* Content Area */}
          <div className="p-5 bg-gray-100 flex-1">
            {/* ✅ Tambahkan Notifikasi di Sini */}
            <SuccessNotification
              isOpen={showSuccess}
              onClose={() => setShowSuccess(false)}
              message="Assessment baru berhasil ditambahkan!"
            />

            {modal && (
            <ModalConfirm
              isOpen={true}
              onCancel={() => setModal(null)}
              onConfirm={confirmStatusChange}
              header={
                modal.mode === 'deactivate'
                  ? 'Non Aktifkan Data'
                  : 'Aktifkan Kembali Data'
              }
              title={
                modal.mode === 'deactivate'
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
                    {modal.mode === 'deactivate'
                      ? 'Kamu bisa mengembalikan kembali data yang sudah dihilangkan.'
                      : 'Kamu bisa menampilkan kembali data yang sudah disembunyikan.'}
                  </div>
                </div>
              </div>
            </ModalConfirm>
          )}


            {/* Container Utama: Toolbar + Tabel + Pagination */}
          <div
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col mx-auto mt-22"
                style={{ width: '1100px', height: '650px', paddingRight: '12px' }}
              >
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-1/4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleCopy}
                      className="border px-9 py-2 rounded-lg bg-white shadow hover:bg-gray-100 transition text-xs"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handlePrint}
                      className="border px-9 py-2 rounded-lg bg-white shadow hover:bg-gray-100 transition text-xs"
                    >
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="border px-12 py-2 rounded-lg bg-white shadow hover:bg-gray-100 transition text-xs"
                    >
                      Download
                    </button>
                    <Button variant="primary" onClick={handleTambah}>
                      Tambah Assessment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabel */}
              <div className="flex-1 overflow-y-auto overflow-x-visible">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className={`px-4 py-3 text-left border border-gray-300 ${col.className || ''}`}
                          style={{ minWidth: col.width, width: col.width }}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, index) => (
                        <tr key={item.nomor} className="hover:bg-gray-50">
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className={`px-4 py-3 text-sm border border-gray-200 ${
                                col.key === 'action'
                                  ? 'bg-white shadow-lg shadow-black/15 z-20'
                                  : ''
                              } ${col.className || ''}`}
                            >
                              {col.key === 'action' ? (
                                <div className="flex justify-center gap-3">
                                  <button
                                    onClick={() => router.push(`/daftar-assessment/edit-assessment/${item.nomor}`)}
                                    className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    <Pencil size={14} className="mr-1" /> Edit
                                  </button>
                                  {item.status === 'Active' ? (
                                    <button
                                      onClick={() => setModal({ index, mode: 'deactivate' })}
                                      className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium"
                                    >
                                      <X size={14} className="mr-1" /> Deactive
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setModal({ index, mode: 'reactivate' })}
                                      className="flex items-center text-green-600 hover:text-green-800 text-xs font-medium"
                                    >
                                      <Check size={14} className="mr-1" /> Reactive
                                    </button>
                                  )}
                                </div>
                              ) : (
                                item[col.key]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-4 py-8 text-center text-gray-500 border-t border-gray-200"
                        >
                          Tidak ada data ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm bg-gray-50 flex-shrink-0">
                <span>{currentData.length} Data ditampilkan</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="bg-gray-200 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50"
                  >
                    {'<'}
                  </button>
                  <span className="font-medium bg-gray-150 w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-50">{page}</span>
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
      
    );
  }