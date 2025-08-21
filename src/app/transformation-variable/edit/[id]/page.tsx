// app/transformation-variable/edit/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditVariablePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('transformationVariables');
    if (!saved) {
      alert('Data tidak ditemukan.');
      router.push('/transformation-variable');
      return;
    }

    try {
      const data = JSON.parse(saved);
      const item = data.find((item: any) => String(item.id) === String(id));

      if (!item) {
        alert('Data dengan ID ini tidak ditemukan.');
        router.push('/transformation-variable');
        return;
      }

      // Simpan ke localStorage untuk form gunakan
      localStorage.setItem('editData', JSON.stringify(item));
      // Redirect ke form (bisa reuse halaman tambah-variable)
      router.push('/transformation-variable/tambah-variable');
    } catch (error) {
      console.error('Error saat load data:', error);
      alert('Terjadi kesalahan saat memuat data.');
      router.push('/transformation-variable');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-700 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return null; // karena langsung redirect
}