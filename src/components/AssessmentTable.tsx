'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSchool } from 'react-icons/fa';
import Table from '@/components/Table';
import SuccessNotification from '@/components/SuccessNotification';
import Button from '@/components/button';
import ModalConfirm from './StarAssessment/ModalConfirm';
import {
  MessageCircleWarning,
  Pencil,
  Eye,
  Play,
  BookOpenCheck,
} from 'lucide-react';
import { Search, Copy, Printer, Download } from 'lucide-react';
import { useListAssessment } from '@/hooks/useAssessment';

// Mapping status
const mapStatusToUI = (
  approvalStatus: string
): { status: string; aksi: 'edit' | 'view' | 'progress' } => {
  switch (approvalStatus) {
    case 'submitted':
      return { status: 'Submitted', aksi: 'edit' };
    case 'approved':
      return { status: 'Approved', aksi: 'view' };
    case 'edit_requested':
      return { status: 'Edit', aksi: 'edit' };
    default:
      return { status: 'Belum Selesai', aksi: 'progress' };
  }
};

const AssessmentTable = ({ hideStartButton = false }) => {
  const { data: apiData, loading, error } = useListAssessment();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [approveAssessmentId, setApproveAssessmentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Baca notifikasi sukses dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showSuccessNotification');
    if (saved) {
      setShowSuccess(true);
      localStorage.removeItem('showSuccessNotification');
    }
  }, []);

  // Transform data API ke format tabel
  const data = apiData.map((item) => {
    const campusName = item.branch?.name || 'Kampus Tidak Diketahui';
    const { status, aksi } = mapStatusToUI(item.approvalStatus);

    const skor = [
      typeof item.countScore1 === 'number' ? item.countScore1 : '-',
      typeof item.countScore2 === 'number' ? item.countScore2 : '-',
      typeof item.countScore3 === 'number' ? item.countScore3 : '-',
      typeof item.countScore4 === 'number' ? item.countScore4 : '-',
    ];
    const hasil = typeof item.tmiScore === 'number' ? item.tmiScore : '-';

    const periode = item.assessmentPeriod
      ? `${item.assessmentPeriod.year}-${item.assessmentPeriod.semester}`
      : '–';

    return {
      id: item.id,
      logo: <FaSchool className="text-blue-600 text-xl" />,
      nama: campusName,
      periode,
      skor,
      hasil,
      status,
      aksi,
      approvalStatus: item.approvalStatus,
    };
  });

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const handleEdit = (id: number) => {
  const item = apiData.find((item) => item.id === id);
  if (item && ['submitted', 'edit_requested'].includes(item.approvalStatus)) {
    localStorage.setItem('currentAssessmentForEdit', JSON.stringify(item));
    const campusName = item.branch?.name || 'Unknown';
    const city = campusName.split(' ').pop() || 'Unknown';
    router.push(`/assessment/${city}?from=edit`);
  }
};
  // 👁️ VIEW: hanya untuk approved
  const handleView = (id: number) => {
    const item = apiData.find((item) => item.id === id);
    if (item && item.approvalStatus === 'approved') {
      localStorage.setItem('currentAssessmentForView', JSON.stringify(item));
      const campusName = item.branch?.name || 'Unknown';
      const city = campusName.split(' ').pop() || 'Unknown';
     router.push(`/assessment/${city}?viewOnly=true`);
    }
  };

  // ✅ Approve (dummy, ganti dengan API call jika ada)
  const handleApprove = (id: number) => {
    setShowModal(false);
    setShowSuccess(true);
    localStorage.setItem('showSuccessNotification', 'true');
  };

  // 🔢 Kolom tabel
  const columns = [
    { header: 'No', key: 'nomor', width: '50px' },
    { header: 'Logo', key: 'logo', width: '60px' },
    { header: 'Nama UPPS/KC', key: 'nama', width: '220px' },
    { header: 'Periode', key: 'periode', width: '140px' },
    { header: 'Skor 1', key: 'skor1', width: '80px' },
    { header: 'Skor 2', key: 'skor2', width: '80px' },
    { header: 'Skor 3', key: 'skor3', width: '80px' },
    { header: 'Skor 4', key: 'skor4', width: '80px' },
    { header: 'Hasil', key: 'hasil', width: '80px' },
    { header: 'Status', key: 'status', width: '120px' },
    { header: 'Aksi', key: 'aksi', width: '120px' },
  ];

  // 🗂️ Data untuk tabel
  const tableData = filteredData.map((item, index) => ({
    nomor: index + 1,
    logo: <div className="flex items-center">{item.logo}</div>,
    nama: (
      <div className="flex items-center gap-2 relative group">
        <span>{item.nama}</span>
        {item.approvalStatus === 'edit_requested' && (
          <div className="relative">
            <MessageCircleWarning
              onClick={() => {
                setApproveAssessmentId(item.id);
                setShowModal(true);
              }}
              className="text-yellow-500 cursor-pointer"
              size={18}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-[13px] rounded-lg px-3 py-1 whitespace-normal w-[220px] shadow-lg z-50 text-center">
              User mengajukan untuk mengubah data. Klik ikon untuk approve.
              <div className="absolute left-1/2 bottom-full -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    ),
    periode: item.periode,
    skor1: item.skor[0],
    skor2: item.skor[1],
    skor3: item.skor[2],
    skor4: item.skor[3],
    hasil: item.hasil,
    status: (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full capitalize ${
          item.status === 'Submitted'
            ? 'bg-blue-800'
            : item.status === 'Approved'
            ? 'bg-green-500'
            : item.status === 'Belum Selesai'
            ? 'bg-red-500'
            : item.status === 'Edit'
            ? 'bg-orange-500'
            : 'bg-gray-500'
        }`}
      >
        {item.status}
      </span>
    ),
    statusText: item.status,
    aksi: (
      <div className="flex items-center justify-start gap-2">
        {['submitted', 'edit_requested'].includes(item.approvalStatus) && (
          <button
            className="text-blue-600 hover:text-blue-800 transition"
            onClick={() => handleEdit(item.id)}
            title="Edit"
          >
            <Pencil size={20} />
          </button>
        )}
        {item.approvalStatus === 'approved' && (
          <button
            className="text-gray-600 hover:text-green-800 transition"
            onClick={() => handleView(item.id)}
            title="Lihat Detail"
          >
            <Eye size={20} />
          </button>
        )}
        {item.approvalStatus === 'edit_requested' && (
          <button
            className="text-green-600 hover:text-green-800 transition"
            onClick={() => {
              setApproveAssessmentId(item.id);
              setShowModal(true);
            }}
            title="Approve"
          >
            <BookOpenCheck size={20} />
          </button>
        )}
        {!['submitted', 'edit_requested', 'approved'].includes(item.approvalStatus) && (
          <div className="text-red-600">
            <Play size={20} />
          </div>
        )}
      </div>
    ),
  }));

  // 📋 COPY
  const handleCopy = () => {
    const headers = [
      'No',
      'Nama UPPS/KC',
      'Periode',
      'Skor 1',
      'Skor 2',
      'Skor 3',
      'Skor 4',
      'Hasil',
      'Status',
    ];
    const rows = tableData.map((row) => [
      row.nomor,
      typeof row.nama === 'string' ? row.nama : row.nama.props.children[0],
      row.periode,
      row.skor1,
      row.skor2,
      row.skor3,
      row.skor4,
      row.hasil,
      row.statusText,
    ].join('\t'));

    navigator.clipboard
      .writeText([headers.join('\t'), ...rows].join('\n'))
      .then(
        () => alert('Data berhasil disalin!'),
        () => alert('Gagal menyalin data.')
      );
  };

  // 🖨️ PRINT
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head><title>Cetak Assessment</title></head>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Pengisian Assessment</h2>
          <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
            <thead>
              <tr>${columns.map((col) => `<th style="text-align:left;background:#f3f4f6;">${col.header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableData.map((row) => `
                <tr>
                  <td>${row.nomor}</td>
                  <td>🏫</td>
                  <td>${typeof row.nama === 'string' ? row.nama : row.nama.props.children[0]}</td>
                  <td>${row.periode}</td>
                  <td>${row.skor1}</td>
                  <td>${row.skor2}</td>
                  <td>${row.skor3}</td>
                  <td>${row.skor4}</td>
                  <td>${row.hasil}</td>
                  <td>${row.statusText}</td>
                  <td>-</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  };

  // 🔽 DOWNLOAD CSV
  const handleDownloadCSV = () => {
    const headers = [
      'No',
      'Nama UPPS/KC',
      'Periode',
      'Skor 1',
      'Skor 2',
      'Skor 3',
      'Skor 4',
      'Hasil',
      'Status',
    ];
    const rows = tableData.map((row) => [
      row.nomor,
      typeof row.nama === 'string' ? row.nama : row.nama.props.children[0],
      row.periode,
      row.skor1,
      row.skor2,
      row.skor3,
      row.skor4,
      row.hasil,
      row.statusText,
    ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','));

    const csv = [`\uFEFF${headers.join(',')}`, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-45 w-full mt-20">
        <p className="text-gray-600">Memuat data assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-45 w-full mt-20">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-45 w-full relative mt-20 space-y-6 overflow-x-auto">
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Assessment berhasil diubah menjadi status Edit!"
      />

      <ModalConfirm
        isOpen={showModal}
        title="Menyetujui pengajuan edit assessment?"
        header="Konfirmasi"
        message="Menyetujui pengajuan edit assessment?"
        confirmLabel="Approve"
        cancelLabel="Tolak"
        onConfirm={() => {
          if (approveAssessmentId !== null) {
            handleApprove(approveAssessmentId);
          }
          setShowModal(false);
          setApproveAssessmentId(null);
        }}
        onCancel={() => {
          setShowModal(false);
          setApproveAssessmentId(null);
        }}
      />

      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Pengisian Assessment
        </h2>
        <p className="text-sm text-gray-600">
          Berikut adalah daftar UPPS/KC yang sudah melakukan assessment
        </p>
      </div>

      {/* Search + Action Buttons */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white shadow-sm w-80">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Cari UPPS/KC..."
              className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={Copy}
              iconPosition="left"
              onClick={handleCopy}
              className="h-10 px-4 py-2 text-sm"
            >
              Copy
            </Button>
            <Button
              variant="outline"
              icon={Printer}
              iconPosition="left"
              onClick={handlePrint}
              className="h-10 px-4 py-2 text-sm"
            >
              Print
            </Button>
            <Button
              variant="outline"
              icon={Download}
              iconPosition="left"
              onClick={handleDownloadCSV}
              className="h-10 px-4 py-2 text-sm"
            >
              Download
            </Button>

            {!hideStartButton && (
              <Button
                variant="primary"
                onClick={() => router.push('/assessment')}
                className="h-10 px-8 py-2 text-sm font-semibold rounded flex items-center gap-2"
              >
                Start Assessment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div id="assessment-table">
        <Table
          columns={columns}
          data={tableData}
          currentPage={1}
          rowsPerPage={10}
        />
      </div>
    </div>
  );
};

export default AssessmentTable;