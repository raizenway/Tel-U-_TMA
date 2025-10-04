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
      1: "Mutu",
      2: "Akademik",
      3: "Akademisi",
      4: "Alumni",
      5: "Kemahasiswaan",
      6: "Kerjasama",
      7: "Keuangan",
      8: "Mahasiswa Asing",
      9: "SDM",
      10: "PPM, Publikasi, HKI",
    };
    return map[id] || "Variabel Tidak Dikenal";
  };

  // Helper: Mapping type → tipeSoal display
  const getTipeSoalDisplay = (type: string): string => {
    const map: Record<string, string> = {
      'multitext': 'Pilihan Jawaban',
      'text': 'Pilihan Jawaban',
      'api': 'API dari iGracias',
      'submit_excel': 'Submit Jawaban Excel',
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

      const questionId = parseInt(id as string);
      if (isNaN(questionId)) {
        alert('ID tidak valid.');
        router.push('/daftar-assessment');
        return;
      }

      try {
        // ✅ Ambil data dari API
      const response = await fetch(`localhost:3000/api/question/${questionId}`);
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

        // ✅ Konversi data API ke format yang diharapkan halaman edit
        const editData = {
          id: question.id,
          nomor: question.id,
          variable: getVariableName(question.transformationVariableId),
          bobot: 1,
          indikator: question.indicator,
          pertanyaan: question.questionText,
          tipeSoal: getTipeSoalDisplay(question.type),
          status: question.status === 'active' ? 'Active' : 'Inactive',
          deskripsiSkor0: question.scoreDescription0,
          deskripsiSkor1: question.scoreDescription1,
          deskripsiSkor2: question.scoreDescription2,
          deskripsiSkor3: question.scoreDescription3,
          deskripsiSkor4: question.scoreDescription4,
          urutan: 1,
        };

        // ✅ Simpan ke localStorage — biar kompatibel dengan halaman edit existing
        localStorage.setItem('editData', JSON.stringify(editData));
        localStorage.setItem('editId', String(question.id));

        // ✅ Redirect ke halaman edit sesuai type
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

  // Tampilkan loading agar tidak kosong
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Membuka halaman edit...</p>
      </div>
    </div>
  );
}