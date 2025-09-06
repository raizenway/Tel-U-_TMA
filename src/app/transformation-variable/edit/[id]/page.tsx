'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetTransformationVariableById } from '@/hooks/useTransformationVariableList';
import { useUpdateTransformationVariable } from '@/hooks/useTransformationVariableList';
import { useEffect, useState } from 'react';
import Button from '@/components/button';
import { X, Save } from 'lucide-react';

export default function EditVariablePage() {
  const { id } = useParams();
  const router = useRouter();

  // ✅ Parse ID
  const variableId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
  if (isNaN(variableId)) {
    router.push('/transformation-variable');
    return null;
  }

  // ✅ Ambil data
  const { data, loading: loadingData, error } = useGetTransformationVariableById(variableId);

  // ✅ State form
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [referensi, setReferensi] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // ✅ Hook update
  const { mutate: update, loading: updating } = useUpdateTransformationVariable();

  // ✅ Isi form
  useEffect(() => {
    if (data) {
      setNamaVariabel(data.name || '');
      setBobot(data.weight?.toString() || '');
      setDeskripsi(data.description || '');
      setReferensi(data.reference || '');
      setStatus(data.status === 'active' ? 'Active' : 'Inactive');
    }
  }, [data]);

  // 🚫 Loading
  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ❌ Error
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">Gagal memuat data</p>
          <p className="text-gray-600 mt-1">{error || 'Data tidak ditemukan'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const handleSimpan = async () => {
  if (!namaVariabel.trim()) {
    alert('Nama variabel wajib diisi');
    return;
  }
  if (!status) {
    alert('Status harus dipilih');
    return;
  }

  const payload = {
    name: namaVariabel.trim(),
    weight: parseFloat(bobot) || 0,
    description: deskripsi.trim(),
    reference: referensi.trim(),
    sortOrder: 1,
    status: status.toLowerCase() as 'active' | 'inactive',
  };

  console.log('📤 Payload:', payload);

  try {
    await update(variableId, payload);
    console.log('✅ Update berhasil — redirect');
    router.push('/transformation-variable');
  } catch (err) {
    console.error('❌ Update gagal:', err);
    alert('Gagal menyimpan perubahan. Coba lagi.');
  }
};

  const handleBatal = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 pt-24">
        <div
          className="bg-white rounded-xl shadow-md mx-auto"
          style={{ width: '1100px', minHeight: '650px' }}
        >
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Edit Variabel</h1>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                <input
                  type="text"
                  value={namaVariabel}
                  onChange={(e) => setNamaVariabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bobot</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={bobot}
                  onChange={(e) => setBobot(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referensi</label>
                <input
                  type="text"
                  value={referensi}
                  onChange={(e) => setReferensi(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Active' || val === 'Inactive') {
                      setStatus(val);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="" disabled>Pilih Status</option>
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Non-Aktif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 flex justify-end gap-4 border-t border-gray-200">
            <Button
              variant="ghost"
              icon={X}
              iconPosition="left"
              onClick={handleBatal}
              disabled={updating}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              disabled={updating}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold text-white"
            >
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}