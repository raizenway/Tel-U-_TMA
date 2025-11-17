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
import { useListAssessment, useAssessmentById } from '@/hooks/useAssessment';

// Helper: Ambil user dari localStorage
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

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

const buildAnswersFromAssessment = (item: any): { [key: string]: string } => {
  const answers: { [key: string]: string } = {};
  if (item.assessmentDetails && Array.isArray(item.assessmentDetails)) {
    item.assessmentDetails.forEach((detail: any) => {
      const qId = detail.questionId;
      const baseKey = String(qId);
      const ans = detail.answer || {};

      const answer1 = 
        ans.textAnswer1 != null && ans.textAnswer1 !== "" 
          ? String(ans.textAnswer1) 
          : detail.submissionValue || "0";
      const answer2 = ans.textAnswer2 != null ? String(ans.textAnswer2) : "0";
      const answer3 = ans.textAnswer3 != null ? String(ans.textAnswer3) : "0";
      const answer4 = ans.textAnswer4 != null ? String(ans.textAnswer4) : "0";
      const answer5 = ans.textAnswer5 != null ? String(ans.textAnswer5) : "0";

      answers[baseKey] = answer1;
      if (answer2 !== "0") answers[`${baseKey}a`] = answer2;
      if (answer3 !== "0") answers[`${baseKey}b`] = answer3;
      if (answer4 !== "0") answers[`${baseKey}c`] = answer4;
      if (answer5 !== "0") answers[`${baseKey}d`] = answer5;

      if (detail.evidenceLink) {
        answers[`evidence-${qId}`] = detail.evidenceLink;
      }
    });
  }
  return answers;
};

const AssessmentTable = ({ hideStartButton = false }) => {
  const {  data: apiData, loading, error } = useListAssessment();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: selectedAssessment, loading: loadingSelected } = useAssessmentById(selectedId);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [approveAssessmentId, setApproveAssessmentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Ambil user saat ini
  const currentUser = getCurrentUser();
  const userRoleId = currentUser?.roleId || currentUser?.role?.id;
  const userBranchId = currentUser?.branchId;
  const userId = currentUser?.id;

  // Redirect setelah data lengkap
  useEffect(() => {
    if (selectedAssessment && selectedId) {
      const answers = buildAnswersFromAssessment(selectedAssessment);
      const isView = selectedAssessment.approvalStatus === 'approved';

      if (isView) {
        localStorage.setItem('currentAssessmentForView', JSON.stringify(selectedAssessment));
      } else {
        localStorage.setItem('currentAssessmentForEdit', JSON.stringify(selectedAssessment));
      }
      localStorage.setItem(`assessment-${selectedId}-answers`, JSON.stringify(answers));

      const branchId = selectedAssessment.branch?.id;
      if (typeof branchId !== 'number' || branchId <= 0) {
        console.error('Branch ID tidak valid:', branchId);
        return;
      }

      if (isView) {
        router.push(`/assessment/${branchId}?viewOnly=true`);
      } else {
        router.push(`/assessment/${branchId}?from=edit`);
      }

      setSelectedId(null);
    }
  }, [selectedAssessment, selectedId, router]);

  useEffect(() => {
    const saved = localStorage.getItem('showSuccessNotification');
    if (saved) {
      setShowSuccess(true);
      localStorage.removeItem('showSuccessNotification');
    }
  }, []);

  // ✅ Filter berdasarkan role user
  const filteredApiData = apiData.filter((item: any) => {
    if (userRoleId === 1) {
      return true; // Super User: lihat semua
    }
    if (userRoleId === 2 && userBranchId) {
      return item.branchId === userBranchId; // UPPS/KC: lihat milik branch-nya
    }
    return false;
  });

  const data = filteredApiData.map((item) => {
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
    const item = filteredApiData.find((item) => item.id === id);
    if (!item || !['submitted', 'edit_requested'].includes(item.approvalStatus)) return;
    setSelectedId(id);
  };

  const handleView = (id: number) => {
    const item = filteredApiData.find((item) => item.id === id);
    if (!item || item.approvalStatus !== 'approved') return;
    setSelectedId(id);
  };

  const handleApprove = (id: number) => {
    setShowModal(false);
    setShowSuccess(true);
    localStorage.setItem('showSuccessNotification', 'Assessment berhasil di-approve!');
  };

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

  const tableData = filteredData.map((item, index) => ({
    nomor: index + 1,
    logo: <div className="flex items-center">{item.logo}</div>,
    nama: (
      <div className="flex items-center gap-2 relative group">
        <span>{item.nama}</span>
        {item.approvalStatus === 'edit_requested' && (
          <div className="relative">
            <MessageCircleWarning
              onClick={(e) => {
                e.stopPropagation();
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
  <button
    className="text-blue-600 hover:text-blue-800 transition"
    onClick={() => handleContinue(item.id)}
    title="Lanjutkan Pengisian"
  >
    <Play size={20} />
  </button>
)}
      </div>
    ),
  }));

  // --- Fungsi utilitas ---
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
      .then(() => alert('Data berhasil disalin!'))
      .catch(() => alert('Gagal menyalin data.'));
  };

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

 const handleContinue = (id: number) => {
  // Ambil data assessment berdasarkan ID
  const item = filteredApiData.find((item) => item.id === id);
  if (!item) {
    console.error("Assessment tidak ditemukan");
    return;
  }

  // Redirect ke halaman assessment dengan ID yang sesuai
  const branchId = item.branch?.id;
  if (typeof branchId !== 'number' || branchId <= 0) {
    console.error('Branch ID tidak valid:', branchId);
    return;
  }

  // Simpan ke localStorage agar bisa dilanjutkan
  // Ganti key agar AssessmentFormTab tahu ini "Lanjutkan", bukan "Edit"
  localStorage.setItem('currentAssessmentForContinue', JSON.stringify(item));

  // Redirect ke halaman assessment
  router.push(`/assessment/${branchId}?from=continue`); // ✅ Tambahkan param baru
};

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

  if (loading || loadingSelected) {
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

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Pengisian Assessment
        </h2>
        <p className="text-sm text-gray-600">
          {userRoleId === 1
            ? 'Daftar semua UPPS/KC'
            : 'Hasil assessment untuk kampus Anda'}
        </p>
      </div>

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

            {!hideStartButton && userRoleId === 2 && (
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