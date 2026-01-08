  'use client';

  import { useEffect, useState, useMemo } from 'react';
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
    CheckCircle,
    Clock,
  } from 'lucide-react';
  import { Search, Copy, Printer, Download } from 'lucide-react';
  import {
    useListAssessment,
    useAssessmentById,
    useRequestEditAssessment,
    useApproveEditAssessment,
  } from '@/hooks/useAssessment';

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

  const mapStatusToUI = (approvalStatus: string): { status: string; aksi: 'edit' | 'view' | 'progress' } => {
    switch (approvalStatus) {
      case 'submitted':
        return { status: 'Submitted', aksi: 'edit' };
      case 'approve_edit':
        return { status: 'Approve Edit', aksi: 'edit' };
      case 'approved':
        return { status: 'Approved', aksi: 'view' };
      case 'edit_requested':
      case 'request_edit':
        return { status: 'Request Edit', aksi: 'edit' };
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
          ans.textAnswer1 != null && ans.textAnswer1 !== ''
            ? String(ans.textAnswer1)
            : detail.submissionValue || '0';
        const answer2 = ans.textAnswer2 != null ? String(ans.textAnswer2) : '0';
        const answer3 = ans.textAnswer3 != null ? String(ans.textAnswer3) : '0';
        const answer4 = ans.textAnswer4 != null ? String(ans.textAnswer4) : '0';
        const answer5 = ans.textAnswer5 != null ? String(ans.textAnswer5) : '0';

        answers[baseKey] = answer1;
        if (answer2 !== '0') answers[`${baseKey}a`] = answer2;
        if (answer3 !== '0') answers[`${baseKey}b`] = answer3;
        if (answer4 !== '0') answers[`${baseKey}c`] = answer4;
        if (answer5 !== '0') answers[`${baseKey}d`] = answer5;

        if (detail.evidenceLink) {
          answers[`evidence-${qId}`] = detail.evidenceLink;
        }
      });
    }
    return answers;
  };

  const AssessmentTable = ({ hideStartButton = false }) => {
    const { data: apiData, loading, error, refetch } = useListAssessment();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: selectedAssessment, loading: loadingSelected } = useAssessmentById(selectedId);
    const { mutate: requestEdit, loading: loadingRequest } = useRequestEditAssessment();
    const { mutate: approveEditAssessment } = useApproveEditAssessment();

    const [showSuccess, setShowSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [approveAssessmentId, setApproveAssessmentId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const currentUser = getCurrentUser();
    const userRoleId = currentUser?.roleId || currentUser?.role?.id;
    const userBranchId = currentUser?.branchId;

    useEffect(() => {
      if (selectedAssessment && selectedId) {
        const answers = buildAnswersFromAssessment(selectedAssessment);
        const isEditingApproved = localStorage.getItem('isEditingApproved') === 'true';
        const isView = selectedAssessment.approvalStatus === 'approved' && !isEditingApproved;

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

    const filteredApiData = useMemo(() => {
      if (!apiData) return [];
      return apiData.filter((item: any) => {
        if (userRoleId === 1) return true;
        if (userRoleId === 4) return true;
        if ((userRoleId === 2 || userRoleId === 3) && userBranchId) {
          return item.branchId === userBranchId;
        }
        return false;
      });
    }, [apiData, userRoleId, userBranchId]);

    const handleEdit = (id: number) => {
      const item = filteredApiData.find((item) => item.id === id);
      if (!item || item.approvalStatus !== 'submitted') return;
      setSelectedId(id);
    };

    const handleEditFromApproved = (id: number) => {
      const item = filteredApiData.find((item) => item.id === id);
      if (!item || item.approvalStatus !== 'approve_edit') return;
      localStorage.setItem('isEditingApproved', 'true');
      setSelectedId(id);
    };

    const handleView = (id: number) => {
      const item = filteredApiData.find((item) => item.id === id);
      if (!item || item.approvalStatus !== 'approved') return;
      setSelectedId(id);
    };

    const handleRequestEdit = async (id: number) => {
      if (loadingRequest) return;
      if (!window.confirm('Ajukan permintaan untuk mengedit assessment ini?')) return;

      try {
        await requestEdit(id);
        alert('✅ Permintaan edit berhasil dikirim. Menunggu persetujuan admin.');
      } catch (err: any) {
        alert('❌ Gagal mengajukan permintaan edit: ' + (err.message || 'Terjadi kesalahan'));
      }
    };

    const handleApprove = async (id: number) => {
      try {
        await approveEditAssessment(id);
        await refetch();
        setShowSuccess(true);
        localStorage.setItem('showSuccessNotification', 'Assessment berhasil di-approve!');
      } catch (err: any) {
        alert('❌ Gagal menyetujui edit: ' + (err.message || 'Terjadi kesalahan'));
      } finally {
        setShowModal(false);
        setApproveAssessmentId(null);
      }
    };

    const handleContinue = (id: number) => {
      const item = filteredApiData.find((item) => item.id === id);
      if (!item) {
        console.error('Assessment tidak ditemukan');
        return;
      }

      const branchId = item.branch?.id;
      if (typeof branchId !== 'number' || branchId <= 0) {
        console.error('Branch ID tidak valid:', branchId);
        return;
      }

      localStorage.setItem('currentAssessmentForContinue', JSON.stringify(item));
      router.push(`/assessment/${branchId}?from=continue`);
    };

    // ✅ MODIFIKASI HANYA DI SINI: filter variabel aktif
    const { tableRows, columns: dynamicColumns, variableNames, variableIds } = useMemo(() => {
      if (!filteredApiData || filteredApiData.length === 0) {
        return { tableRows: [], columns: [], variableNames: [], variableIds: [] };
      }

      const activeVariables = new Map<number, string>();

      filteredApiData.forEach((item) => {
        if (item.variableScore && Array.isArray(item.variableScore)) {
          item.variableScore.forEach((vs: any) => {
            // Anggap aktif jika `isActive` tidak false
            if (vs.isActive !== false) {
              if (!activeVariables.has(vs.id)) {
                activeVariables.set(vs.id, vs.name);
              }
            }
          });
        }
      });

      const sortedVariableEntries = Array.from(activeVariables.entries()).sort((a, b) => a[0] - b[0]);
      const uniqueVariableNames = sortedVariableEntries.map(([, name]) => name);
      const uniqueVariableIds = sortedVariableEntries.map(([id]) => id);

      const dynamicCols = [
        { header: 'No', key: 'nomor', width: '50px' },
        { header: 'Logo', key: 'logo', width: '60px' },
        { header: 'Nama UPPS/KC', key: 'nama', width: '220px' },
        { header: 'Periode', key: 'periode', width: '140px' },
        ...uniqueVariableNames.map((name, idx) => ({
          header: name,
          key: `varScore_${uniqueVariableIds[idx]}`,
          width: '120px',
        })),
        { header: 'Hasil', key: 'hasil', width: '80px' },
        { header: 'Status', key: 'status', width: '120px' },
        { header: 'Aksi', key: 'aksi', width: '120px' },
      ];

      const tableRows = filteredApiData.map((item, index) => {
        const campusName = item.branch?.name || 'Kampus Tidak Diketahui';
        const { status } = mapStatusToUI(item.approvalStatus);
        const hasil = typeof item.tmiScore === 'number' ? item.tmiScore : '-';
        const periode = item.assessmentPeriod
          ? `${item.assessmentPeriod.year}-${item.assessmentPeriod.semester}`
          : '–';

        const scoreMap = new Map<number, number | string>();
        if (item.variableScore && Array.isArray(item.variableScore)) {
          item.variableScore.forEach((vs: any) => {
            if (vs.isActive !== false) {
              scoreMap.set(vs.id, typeof vs.score === 'number' ? vs.score : '-');
            }
          });
        }

        const variableScores: Record<string, number | string> = {};
        uniqueVariableIds.forEach((id) => {
          variableScores[`varScore_${id}`] = scoreMap.get(id) ?? '-';
        });

        const renderAksi = () => {
          if (item.approvalStatus === 'submitted' && userRoleId !== 4) {
            return (
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleEdit(item.id)}
                title="Edit Assessment"
              >
                <Pencil size={20} />
              </button>
            );
          }

          if (item.approvalStatus === 'approve_edit') {
            return (
              <div>
                {userRoleId !== 4 && (
                  <button
                    className="text-green-600 hover:text-blue-800 transition"
                    onClick={() => handleEditFromApproved(item.id)}
                    title="Edit Assessment"
                  >
                    <Pencil size={20} />
                  </button>
                )}
              </div>
            );
          }

          if (item.approvalStatus === 'approved') {
            return (
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-600 hover:text-green-800 transition"
                  onClick={() => handleView(item.id)}
                  title="Lihat Detail"
                >
                  <Eye size={20} />
                </button>
                {userRoleId !== 4 && (
                  <button
                    className={`text-orange-600 hover:text-orange-800 transition ${
                      loadingRequest ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestEdit(item.id);
                    }}
                    title="Ajukan Permintaan Edit"
                    disabled={loadingRequest}
                  >
                    <Pencil size={20} />
                  </button>
                )}
              </div>
            );
          }

          if (item.approvalStatus === 'edit_requested' || item.approvalStatus === 'request_edit') {
            if (userRoleId === 1) {
              return (
                <button
                  className="text-orange-500 hover:text-orange-700 transition"
                  onClick={() => {
                    setApproveAssessmentId(item.id);
                    setShowModal(true);
                  }}
                  title="Approve Permintaan Edit"
                >
                  <Clock size={20} />
                </button>
              );
            } else {
              return (
                <span title="Tunggu persetujuan dari admin" className="text-gray-400 cursor-not-allowed">
                  <Clock size={20} />
                </span>
              );
            }
          }

          if (
            !['submitted', 'approve_edit', 'edit_requested', 'request_edit', 'approved'].includes(item.approvalStatus) &&
            userRoleId !== 4
          ) {
            return (
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleContinue(item.id)}
                title="Lanjutkan Pengisian"
              >
                <Play size={20} />
              </button>
            );
          }

          return null;
        };

        return {
          nomor: index + 1,
          id: item.id,
          logo: <FaSchool className="text-blue-600 text-xl" />,
          nama: campusName,
          namaElement: (
            <div className="flex items-center gap-2 relative group">
              <span>{campusName}</span>
              {(item.approvalStatus === 'edit_requested' || item.approvalStatus === 'request_edit') && (
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
          ...variableScores,
          hasil,
          status: (
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full capitalize ${
                status === 'Submitted'
                  ? 'bg-blue-800'
                  : status === 'Approved'
                  ? 'bg-green-500'
                  : status === 'Approve Edit'
                  ? 'bg-green-500'
                  : status === 'Belum Selesai'
                  ? 'bg-red-500'
                  : status === 'Request Edit'
                  ? 'bg-orange-500'
                  : 'bg-gray-500'
              }`}
            >
              {status}
            </span>
          ),
          statusText: status,
          aksi: renderAksi(),
        };
      });

      return { tableRows, columns: dynamicCols, variableNames: uniqueVariableNames, variableIds: uniqueVariableIds };
    }, [filteredApiData, loadingRequest, userRoleId]);

    const filteredData = useMemo(
      () => tableRows.filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase())),
      [tableRows, searchTerm]
    );

    const handleCopy = () => {
      const headers = ['No', 'Nama UPPS/KC', 'Periode', ...variableNames, 'Hasil', 'Status'];
      const rows = filteredData.map((row) => [
        row.nomor,
        row.nama,
        row.periode,
        ...variableIds.map((id) => row[`varScore_${id}`]),
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
      const headers = ['No', 'Nama UPPS/KC', 'Periode', ...variableNames, 'Hasil', 'Status'];
      const rows = filteredData.map((row) => [
        row.nomor,
        row.nama,
        row.periode,
        ...variableIds.map((id) => row[`varScore_${id}`]),
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
                <tr>${headers.map((h) => `<th style="text-align:left;background:#f3f4f6;">${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
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
      const headers = ['No', 'Nama UPPS/KC', 'Periode', ...variableNames, 'Hasil', 'Status'];
      const rows = filteredData.map((row) => [
        row.nomor,
        row.nama,
        row.periode,
        ...variableIds.map((id) => row[`varScore_${id}`]),
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
          message="Assessment berhasil di-approve!"
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pengisian Assessment</h2>
          <p className="text-sm text-gray-600">
            {userRoleId === 1
              ? 'Daftar semua UPPS/KC'
              : userRoleId === 4
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
              <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy} className="h-10 px-4 py-2 text-sm">
                Copy
              </Button>
              <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint} className="h-10 px-4 py-2 text-sm">
                Print
              </Button>
              <Button variant="outline" icon={Download} iconPosition="left" onClick={handleDownloadCSV} className="h-10 px-4 py-2 text-sm">
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
          <Table columns={dynamicColumns} data={filteredData} currentPage={1} rowsPerPage={10} />
        </div>
      </div>
    );
  };

  export default AssessmentTable;