// app/daftar-assessment/edit-assessment/[id]/page.tsx
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

  useEffect(() => {
    const saved = localStorage.getItem('assessmentList');
    if (!saved) {
      alert('Data tidak ditemukan.');
      router.push('/daftar-assessment');
      return;
    }

    try {
      const list = JSON.parse(saved);
      const item = list.find((item: any) => String(item.nomor) === String(id));

      if (!item) {
        alert(`Data dengan nomor ${id} tidak ditemukan.`);
        router.push('/daftar-assessment');
        return;
      }

      // Simpan data untuk diedit
      localStorage.setItem('editData', JSON.stringify(item));

      // Redirect sesuai tipe soal
      const targetPath = EDIT_PATH_MAP[item.tipeSoal];
      if (targetPath) {
        router.push(targetPath);
      } else {
        console.warn('Tipe soal tidak dikenali:', item.tipeSoal);
        alert(`Halaman edit untuk tipe "${item.tipeSoal}" belum tersedia.`);
        router.push('/daftar-assessment');
      }
    } catch (error) {
      console.error('Gagal memproses edit:', error);
      alert('Terjadi kesalahan saat membuka halaman edit.');
      router.push('/daftar-assessment');
    }
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