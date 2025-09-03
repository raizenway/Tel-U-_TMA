  // app/transformation-variable/edit/[id]/page.tsx
  'use client';

  import { useParams, useRouter } from 'next/navigation';
  import { useEffect, useState } from 'react';
  import { getTransformationVariableById } from '@/lib/api-transformation-variable';
  import { PutTransformationVariableRequest } from '@/interfaces/transformation-variable';

  export default function EditVariablePage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Handle jika id adalah array
      const variableId = Array.isArray(id) ? id[0] : id;

      if (!variableId) {
        alert('ID tidak valid.');
        router.push('/transformation-variable');
        return;
      }

      const fetchVariable = async () => {
        try {
          // ✅ Ambil data dari API dengan GET
          const response = await getTransformationVariableById(Number(variableId));

          if (response.status === 'success' && response.data) {
            // Simpan ke localStorage agar form bisa isi otomatis
            localStorage.setItem('editData', JSON.stringify(response.data));
            // Redirect ke form tambah/edit
            router.push('/transformation-variable/tambah-variable');
          } else {
            alert(response.message || 'Data tidak ditemukan.');
            router.push('/transformation-variable');
          }
        } catch (error) {
          console.error('Gagal ambil data dari API:', error);
          alert('Gagal memuat data. Periksa koneksi atau server backend.');
          router.push('/transformation-variable');
        } finally {
          setLoading(false);
        }
      };

      fetchVariable();
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