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
    // Ambil daftar assessment dari localStorage
    const saved = localStorage.getItem('assessmentList');
    if (!saved) {
      alert('Data assessment tidak ditemukan. Silakan kembali ke daftar.');
      router.push('/daftar-assessment');
      return;
    }

    try {
      const list = JSON.parse(saved);

      // Pastikan id adalah string yang valid
      const targetId = String(id);
      if (!targetId || targetId.trim() === '') {
        alert('ID tidak valid.');
        router.push('/daftar-assessment');
        return;
      }

      // Cari item berdasarkan nomor
      const item = list.find((item: any) => String(item.nomor) === targetId);

      if (!item) {
        alert(`Data dengan nomor ${id} tidak ditemukan.`);
        router.push('/daftar-assessment');
        return;
      }

      // ✅ Simpan data lengkap untuk diedit
      localStorage.setItem('editData', JSON.stringify(item));

      // ✅ SIMPAN editId — INI YANG KRITIS!
      // Ini akan dibaca di halaman tujuan (api-igracias, pilih-jawaban, dll)
      localStorage.setItem('editId', String(item.nomor));

      // Redirect ke halaman edit sesuai tipe soal
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
      alert('Terjadi kesalahan saat membuka halaman edit. Silakan coba lagi.');
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