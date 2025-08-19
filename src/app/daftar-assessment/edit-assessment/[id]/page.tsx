// app/edit/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();

  // Mapping tipe soal ke halaman tujuan
  const redirectMap: Record<string, string> = {
    'API dari iGracias': '/daftar-assessment/api-igracias',
    'Pilihan Jawaban': '/daftar-assessment/pilih-jawaban',
    'Submit Jawaban Excel': '/daftar-assessment/submit-excel',
  };

  useEffect(() => {
    // 1. Ambil data dari localStorage
    const saved = localStorage.getItem('assessmentList');
    if (!saved) {
      alert('Tidak ada data tersimpan.');
      router.push('/daftar-assessment');
      return;
    }

    let list;
    try {
      list = JSON.parse(saved);
    } catch (e) {
      console.error('Gagal parsing assessmentList:', e);
      alert('Data assessment rusak.');
      router.push('/daftar-assessment');
      return;
    }

    // 2. Cari item berdasarkan nomor (string safe)
    const item = list.find((item: any) => String(item.nomor) === String(id));

    if (!item) {
      alert(`Data dengan ID ${id} tidak ditemukan.`);
      router.push('/daftar-assessment');
      return;
    }

    // 3. Simpan data untuk diedit di halaman tujuan
    localStorage.setItem('editData', JSON.stringify(item));

    // 4. Redirect sesuai tipe soal
    const targetPath = redirectMap[item.tipeSoal];
    if (targetPath) {
      router.push(targetPath);
    } else {
      // Jika tipe soal tidak dikenali
      console.warn('Tipe soal tidak dikenali:', item.tipeSoal);
      alert(`Tipe soal "${item.tipeSoal}" tidak dikenali. Arahkan ke daftar assessment.`);
      router.push('/daftar-assessment');
    }
  }, [id, router]);

  // 🔇 Tidak render apapun — ini hanya halaman redirector
  return null;
}