'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaSchool } from 'react-icons/fa';
import Table from '@/components/Table'; // Pastikan path ini benar
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
  const {  data:apiData, loading, error } = useListAssessment();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const {  data:selectedAssessment, loading: loadingSelected } = useAssessmentById(selectedId);

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

      // Baca flag dari localStorage
      const isEditingApproved = localStorage.getItem('isEditingApproved') === 'true';

      // Tentukan mode berdasarkan status dan flag
      const isView = selectedAssessment.approvalStatus === 'approved' && !isEditingApproved;

      if (isView) {
        localStorage.setItem('currentAssessmentForView', JSON.stringify(selectedAssessment));
      } else {
        // Jika mode edit (termasuk edit dari approved), simpan ke key edit
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
        // Jika edit dari approved, tambahkan param ?from=editFromApproved
        // atau cukup ?from=edit jika tidak perlu dibedakan
        router.push(`/assessment/${branchId}?from=edit`);
      }

      // Hapus flag setelah digunakan
      localStorage.removeItem('isEditingApproved');

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
  const filteredApiData = useMemo(() => {
    if (!apiData) return [];
    return apiData.filter((item: any) => {
      if (userRoleId === 1) {
        return true; // Super User: lihat semua
      }
      // Jika role adalah Non SSO (roleId = 4), tampilkan semua data
      if (userRoleId === 4) {
        return true;
      }
      if (userRoleId === 2 && userBranchId) {
        return item.branchId === userBranchId; // UPPS/KC: lihat milik branch-nya
      }
      // Untuk role lain (misalnya SSO - roleId = 3), jika tidak ada filter khusus, bisa return false
      // atau sesuaikan logika. Untuk sementara, asumsi roleId 3 (SSO) tetap filter branch jika ada.
      if (userRoleId === 3 && userBranchId) {
         return item.branchId === userBranchId;
      }
      // Default behavior untuk role lain jika tidak ada kondisi spesifik
      return false;
    });
  }, [apiData, userRoleId, userBranchId]);

  // Deklarasikan fungsi-fungsi sebelum digunakan di useMemo lainnya
  const handleEdit = (id: number) => {
    const item = filteredApiData.find((item) => item.id === id);
    if (!item || !['submitted', 'edit_requested'].includes(item.approvalStatus)) return;
    setSelectedId(id);
  };

  const handleEditFromApproved = (id: number) => {
    const item = filteredApiData.find((item) => item.id === id);
    if (!item || item.approvalStatus !== 'approved') return;
    // Tandai bahwa ini adalah edit dari approved
    localStorage.setItem('isEditingApproved', 'true');
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

  // --- Bagian dinamis untuk variableScore ---
  const { tableRows, columns: dynamicColumns, variableNames, variableIds } = useMemo(() => {
    if (!filteredApiData || filteredApiData.length === 0) {
      // Kembalikan objek dengan struktur yang konsisten
      return {  tableRows: [], columns: [], variableNames: [], variableIds: [] };
    }

    // Ambil semua nama variabel unik dari SEMUA item, urutkan berdasarkan id
    // Kita gunakan Map untuk menjaga urutan dan menghindari duplikat
    const allVariableNames = new Map<number, string>();
    filteredApiData.forEach(item => {
      if (item.variableScore && Array.isArray(item.variableScore)) {
        item.variableScore.forEach((vs: any) => {
          if (!allVariableNames.has(vs.id)) {
            allVariableNames.set(vs.id, vs.name);
          }
        });
      }
    });

    // Urutkan berdasarkan ID untuk konsistensi tampilan kolom
    const sortedVariableEntries = Array.from(allVariableNames.entries()).sort((a, b) => a[0] - b[0]);
    const uniqueVariableNames = sortedVariableEntries.map(([id, name]) => name);
    const uniqueVariableIds = sortedVariableEntries.map(([id, name]) => id); // Simpan IDs juga

    // Buat kolom dinamis berdasarkan nama variabel
    const dynamicCols = [
      { header: 'No', key: 'nomor', width: '50px' },
      { header: 'Logo', key: 'logo', width: '60px' },
      { header: 'Nama UPPS/KC', key: 'nama', width: '220px' },
      { header: 'Periode', key: 'periode', width: '140px' },
      ...uniqueVariableNames.map((name, idx) => ({
        header: name, // Gunakan 'name' dari variableScore sebagai header
        key: `varScore_${uniqueVariableIds[idx]}`, // Gunakan ID sebagai bagian dari key untuk mapping
        width: '120px', // Atur lebar default, bisa disesuaikan
      })),
      { header: 'Hasil', key: 'hasil', width: '80px' },
      { header: 'Status', key: 'status', width: '120px' },
      { header: 'Aksi', key: 'aksi', width: '120px' },
    ];

    // Buat data tabel dengan nilai skor dari variableScore
    // Sertakan juga nama asli (campusName) untuk keperluan pencarian dan utilitas
    const tableRows = filteredApiData.map((item, index) => {
      const campusName = item.branch?.name || 'Kampus Tidak Diketahui';
      const { status, aksi } = mapStatusToUI(item.approvalStatus);
      const hasil = typeof item.tmiScore === 'number' ? item.tmiScore : '-';

      const periode = item.assessmentPeriod
        ? `${item.assessmentPeriod.year}-${item.assessmentPeriod.semester}`
        : '–';

      // Buat mapping dari id variabel ke nilainya untuk item ini
      // ✅ PERUBAHAN: Pastikan nilai 0 tetap ditampilkan sebagai 0, bukan '-'
      const scoreMap = item.variableScore?.reduce((acc: Record<number, number | string>, vs: any) => {
        acc[vs.id] = vs.score === 0 ? 0 : (typeof vs.score === 'number' ? vs.score : '-');
        return acc;
      }, {} as Record<number, number | string>) || {};

      // Isi nilai skor ke dalam objek data berdasarkan urutan ID variabel
      const variableScores: Record<string, number | string> = {};
      uniqueVariableIds.forEach((id, idx) => {
        // ✅ PERUBAHAN: Gunakan nilai dari scoreMap yang sudah diperbarui logikanya
        variableScores[`varScore_${id}`] = scoreMap[id];
      });

      return {
        nomor: index + 1, // Tambahkan properti nomor
        id: item.id,
        logo: <FaSchool className="text-blue-600 text-xl" />,
        nama: campusName, // Simpan nama asli sebagai string untuk pencarian dan utilitas
        namaElement: ( // Simpan elemen JSX untuk render di tabel
          <div className="flex items-center gap-2 relative group">
            <span>{campusName}</span>
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
        periode,
        ...variableScores, // Masukkan nilai skor ke dalam objek data
        hasil,
        status: (
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full capitalize ${
              status === 'Submitted'
                ? 'bg-blue-800'
                : status === 'Approved'
                ? 'bg-green-500'
                : status === 'Belum Selesai'
                ? 'bg-red-500'
                : status === 'Edit'
                ? 'bg-orange-500'
                : 'bg-gray-500'
            }`}
          >
            {status}
          </span>
        ),
        statusText: status,
        aksi: (
          <div className="flex items-center justify-start gap-2">
            {/* Tombol Edit: Muncul jika status memungkinkan DAN bukan role Non-SSO */}
            {['submitted', 'edit_requested'].includes(item.approvalStatus) && userRoleId !== 4 && (
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleEdit(item.id)} // Fungsi sudah dideklarasikan sebelumnya
                title="Edit"
              >
                <Pencil size={20} />
              </button>
            )}
            {/* Tombol Edit dari Approved: Muncul jika status approved DAN bukan role Non-SSO */}
            {item.approvalStatus === 'approved' && userRoleId !== 4 && (
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleEditFromApproved(item.id)} // Fungsi sudah dideklarasikan sebelumnya
                title="Edit Assessment"
              >
                <Pencil size={20} />
              </button>
            )}
            {/* Tombol View: Muncul jika status approved - SELALU muncul, termasuk untuk Non-SSO */}
            {item.approvalStatus === 'approved' && (
              <button
                className="text-gray-600 hover:text-green-800 transition"
                onClick={() => handleView(item.id)} // Fungsi sudah dideklarasikan sebelumnya
                title="Lihat Detail"
              >
                <Eye size={20} />
              </button>
            )}
            {/* Tombol Approve: Muncul jika status edit_requested DAN bukan role Non-SSO */}
            {item.approvalStatus === 'edit_requested' && userRoleId !== 4 && (
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
            {/* Tombol Lanjutkan: Muncul jika status bukan submitted, approved, edit_requested DAN bukan role Non-SSO */}
            {!['submitted', 'edit_requested', 'approved'].includes(item.approvalStatus) && userRoleId !== 4 && (
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleContinue(item.id)} // Fungsi sudah dideklarasikan sebelumnya
                title="Lanjutkan Pengisian"
              >
                <Play size={20} />
              </button>
            )}
          </div>
        ),
      };
    });

    return {  tableRows, columns: dynamicCols, variableNames: uniqueVariableNames, variableIds: uniqueVariableIds };
  }, [filteredApiData]); // Hanya bergantung pada filteredApiData, karena fungsi handler dideklarasikan di luar useMemo ini

  // Gunakan tableRows sebagai filteredData, karena sudah difilter sebelumnya
  const filteredData = useMemo(() => 
    tableRows.filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) // Gunakan string nama asli untuk pencarian
    ),
    [tableRows, searchTerm]
  );

  // --- Fungsi utilitas ---
  // Gunakan variableIds yang dihasilkan dari useMemo utama
  const handleCopy = () => {
    const headers = [
      'No',
      'Nama UPPS/KC',
      'Periode',
      ...variableNames, // Gunakan nama variabel yang dinamis
      'Hasil',
      'Status',
    ];
    const rows = filteredData.map((row) => [
      row.nomor,
      row.nama, // Gunakan string nama asli
      row.periode,
      ...variableIds.map(id => row[`varScore_${id}`]), // Ambil nilai skor berdasarkan ID yang konsisten
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
    const headers = [
      'No',
      'Nama UPPS/KC',
      'Periode',
      ...variableNames, // Gunakan nama variabel yang dinamis
      'Hasil',
      'Status',
    ];
    const rows = filteredData.map((row) => [
      row.nomor,
      row.nama, // Gunakan string nama asli
      row.periode,
      ...variableIds.map(id => row[`varScore_${id}`]), // Ambil nilai skor berdasarkan ID yang konsisten
      row.hasil,
      row.statusText,
    ]);
    const content = `
      <html>
        <head><title>Cetak Assessment</title></head>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Pengisian Assessment</h2>
          <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
            <thead>
              <tr>${headers.map(h => `<th style="text-align:left;background:#f3f4f6;">${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
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

  const handleDownloadCSV = () => {
    const headers = [
      'No',
      'Nama UPPS/KC',
      'Periode',
      ...variableNames, // Gunakan nama variabel yang dinamis
      'Hasil',
      'Status',
    ];
    const rows = filteredData.map((row) => [
      row.nomor,
      row.nama, // Gunakan string nama asli
      row.periode,
      ...variableIds.map(id => row[`varScore_${id}`]), // Ambil nilai skor berdasarkan ID yang konsisten
      row.hasil,
      row.statusText,
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

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
            : userRoleId === 4 // Tambahkan pesan khusus untuk Non-SSO jika diperlukan
            ? 'Daftar semua assessment (Role Non-SSO)'
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

            {/* Tombol Start Assessment: Sembunyikan untuk role Non-SSO */}
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
          columns={dynamicColumns} // Gunakan kolom dinamis
          data={filteredData}
          currentPage={1}
          rowsPerPage={10}
        />
      </div>
    </div>
  );
};

export default AssessmentTable;