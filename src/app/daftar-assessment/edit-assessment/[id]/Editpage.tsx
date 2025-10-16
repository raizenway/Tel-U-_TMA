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

  // Helper: Mapping transformationVariableId → nama variabel
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

  // Helper: Mapping type → tipeSoal display
  const getTipeSoalDisplay = (type: string): string => {
    const map: Record<string, string> = {
      multitext: 'Pilihan Jawaban',
      text: 'Pilihan Jawaban',
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
          throw new Error('Gagal memuat data');
        }
        const result = await response.json();
        const question = result.data;

        if (!question) {
          alert(`Data dengan ID ${id} tidak ditemukan.`);
          router.push('/daftar-assessment');
          return;
        }

        // Konversi data API ke format yang diharapkan halaman edit
        const editData = {
          // Identitas
          nomor: question.id,
          transformationVariableId: question.transformationVariableId,

          // Konten utama
          bobot: question.bobot || 1,
          indikator: question.indicator || '',
          keyIndicator: question.keyIndicator || '',
          reference: question.reference || '',
          dataSource: question.dataSource || '',

          // Pertanyaan
          questionText: question.questionText || '',
          questionText2: question.questionText2 || '',
          questionText3: question.questionText3 || '',
          questionText4: question.questionText4 || '',

          // Jawaban untuk tipe PG
          answerText1: question.answerText1 || '',
          answerText2: question.answerText2 || '',
          answerText3: question.answerText3 || '',
          answerText4: question.answerText4 || '',
          answerText5: question.answerText5 || '',

          // Skor untuk tipe short-answer (legacy)
          scoreMin0: question.scoreMin0 || '',
          scoreMax0: question.scoreMax0 || '',
          scoreMin1: question.scoreMin1 || '',
          scoreMax1: question.scoreMax1 || '',
          scoreMin2: question.scoreMin2 || '',
          scoreMax2: question.scoreMax2 || '',
          scoreMin3: question.scoreMin3 || '',
          scoreMax3: question.scoreMax3 || '',
          scoreMin4: question.scoreMin4 || '',
          scoreMax4: question.scoreMax4 || '',

          scoreDescription0: question.scoreDescription0 || '',
          scoreDescription1: question.scoreDescription1 || '',
          scoreDescription2: question.scoreDescription2 || '',
          scoreDescription3: question.scoreDescription3 || '',
          scoreDescription4: question.scoreDescription4 || '',

          // Skor numerik (format baru — pastikan konsisten kapitalisasi)
          minScore0: question.minScore0 != null ? String(question.minScore0) : '0',
          maxScore0: question.maxScore0 != null ? String(question.maxScore0) : '1.9',
          minScore1: question.minScore1 != null ? String(question.minScore1) : '2',
          maxScore1: question.maxScore1 != null ? String(question.maxScore1) : '4.9',
          minScore2: question.minScore2 != null ? String(question.minScore2) : '5',
          maxScore2: question.maxScore2 != null ? String(question.maxScore2) : '6.9', // ✅ typo diperbaiki
          minScore3: question.minScore3 != null ? String(question.minScore3) : '7',
          maxScore3: question.maxScore3 != null ? String(question.maxScore3) : '8.9',
          minScore4: question.minScore4 != null ? String(question.minScore4) : '9',
          maxScore4: question.maxScore4 != null ? String(question.maxScore4) : '12',

          // Metadata
          order: question.order || 1,
          status: question.status === 'active' ? 'Active' : 'Inactive',
          type: question.type,
        };

        localStorage.setItem('editData', JSON.stringify(editData));
        localStorage.setItem('editId', String(question.id));

        const targetPath = EDIT_PATH_MAP[getTipeSoalDisplay(question.type)];
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