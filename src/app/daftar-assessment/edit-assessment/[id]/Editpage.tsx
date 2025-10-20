'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Mapping tipe soal ke halaman edit
const EDIT_PATH_MAP: Record<string, string> = {
  'API dari iGracias': '/daftar-assessment/api-igracias',
  'Pilihan Jawaban': '/daftar-assessment/pilih-jawaban',
  'Submit Jawaban Excel': '/daftar-assessment/submit-excel',
};

export default function EditAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();

  // Helper: Mapping transformationVariableId → nama variabel (opsional, tidak dipakai di sini)
  const getVariableName = (id: number): string => {
    const map: Record<number, string> = {
      1: 'Mutu',
      2: 'Akademik',
      3: 'Akademisi',
      4: 'Alumni',
      5: 'Kemahasiswaan',
      6: 'Kerjasama',
      7: 'Keuangan',
      8: 'Mahasiswa Asing',
      9: 'SDM',
      10: 'PPM, Publikasi, HKI',
    };
    return map[id] || 'Variabel Tidak Dikenal';
  };

  // ✅ Perbaikan: 'text' dan 'multitext' keduanya → 'Pilihan Jawaban'
  // Karena halaman /pilih-jawaban mendukung 2 tipe via state `tipePertanyaan`
  const getTipeSoalDisplay = (type: string): string => {
    const map: Record<string, string> = {
      multitext: 'Pilihan Jawaban',
      text: 'Pilihan Jawaban', // ✅ tetap ke halaman yang sama
      api: 'API dari iGracias',
      submit_excel: 'Submit Jawaban Excel',
    };
    return map[type] || type;
  };

  useEffect(() => {
    const loadAndRedirect = async () => {
      if (!id) {
        alert('ID tidak valid.');
        router.push('/daftar-assessment');
        return;
      }

      const questionId = parseInt(id as string, 10);
      if (isNaN(questionId)) {
        alert('ID tidak valid.');
        router.push('/daftar-assessment');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL belum diatur di .env.local');
        alert('Konfigurasi API tidak lengkap.');
        router.push('/daftar-assessment');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/question/${questionId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        const question = result.data;

        if (!question) {
          alert(`Data dengan ID ${id} tidak ditemukan.`);
          router.push('/daftar-assessment');
          return;
        }

       // Cek tipe soal
const isShortAnswer = question.type === 'text';

const editData = {
  nomor: question.id,
  transformationVariableId: question.transformationVariableId ?? null,
  bobot: question.bobot ?? 1,
  indikator: question.indicator ?? '',
  keyIndicator: question.keyIndicator ?? '',
  reference: question.reference ?? '',
  dataSource: question.dataSource ?? '',
  questionText: question.questionText ?? '',
  questionText2: question.questionText2 ?? '',
  questionText3: question.questionText3 ?? '',
  questionText4: question.questionText4 ?? '',
  answerText1: question.answerText1 ?? '',
  answerText2: question.answerText2 ?? '',
  answerText3: question.answerText3 ?? '',
  answerText4: question.answerText4 ?? '',
  answerText5: question.answerText5 ?? '',

  // ✅ SELALU load deskripsi skor
  scoreDescription0: question.scoreDescription0 ?? 'Tidak ada dokumentasi.',
  scoreDescription1: question.scoreDescription1 ?? 'Ada dokumentasi dasar.',
  scoreDescription2: question.scoreDescription2 ?? 'Dokumentasi sebagian lengkap.',
  scoreDescription3: question.scoreDescription3 ?? 'Dokumentasi hampir lengkap.',
  scoreDescription4: question.scoreDescription4 ?? 'Dokumentasi lengkap dan terupdate.',

  // 🔹 Rentang skor: HANYA load jika tipe = 'text'
  minScore0: isShortAnswer && question.minScore0 != null ? String(question.minScore0) : '',
  maxScore0: isShortAnswer && question.maxScore0 != null ? String(question.maxScore0) : '',
  minScore1: isShortAnswer && question.minScore1 != null ? String(question.minScore1) : '',
  maxScore1: isShortAnswer && question.maxScore1 != null ? String(question.maxScore1) : '',
  minScore2: isShortAnswer && question.minScore2 != null ? String(question.minScore2) : '',
  maxScore2: isShortAnswer && question.maxScore2 != null ? String(question.maxScore2) : '',
  minScore3: isShortAnswer && question.minScore3 != null ? String(question.minScore3) : '',
  maxScore3: isShortAnswer && question.maxScore3 != null ? String(question.maxScore3) : '',
  minScore4: isShortAnswer && question.minScore4 != null ? String(question.minScore4) : '',
  maxScore4: isShortAnswer && question.maxScore4 != null ? String(question.maxScore4) : '',

  order: question.order ?? 1,
  status: question.status === 'active' ? 'Active' : 'Inactive',
  type: question.type ?? 'text',
};

        localStorage.setItem('editData', JSON.stringify(editData));
        localStorage.setItem('editId', String(question.id));

        const displayType = getTipeSoalDisplay(question.type);
        const targetPath = EDIT_PATH_MAP[displayType];

        if (targetPath) {
          router.push(targetPath);
        } else {
          console.warn('Tipe soal tidak dikenali:', question.type);
          alert(`Halaman edit untuk tipe "${question.type}" belum tersedia.`);
          router.push('/daftar-assessment');
        }
      } catch (error) {
        console.error('Gagal memproses edit:', error);
        alert('Terjadi kesalahan saat membuka halaman edit. Silakan coba lagi.');
        router.push('/daftar-assessment');
      }
    };

    loadAndRedirect();
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Membuka halaman edit...</p>
      </div>
    </div>
  );
}