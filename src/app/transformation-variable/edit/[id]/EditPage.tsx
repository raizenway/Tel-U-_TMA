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
  const [levelDescription1, setLevelDescription1] = useState('');
  const [levelDescription2, setLevelDescription2] = useState('');
  const [levelDescription3, setLevelDescription3] = useState('');
  const [levelDescription4, setLevelDescription4] = useState('');
  const [referensi, setReferensi] = useState('');
  const [urutan, setUrutan] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // 🖼️ State logo — hanya untuk preview, tidak dikirim ke API
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ✅ Hook update
  const { mutate: update, loading: updating } = useUpdateTransformationVariable();

useEffect(() => {
  if (!data || !variableId) return;

  // Jika data adalah respons API (punya properti 'data'), ambil dari sana
  const item = ('data' in data && typeof data === 'object') ? (data as any).data : data;

  if (!item) {
    console.log('❌ Item tidak ditemukan');
    return;
  }

  setNamaVariabel(item.name || '');
  setBobot(item.weight?.toString() || '');
  setDeskripsi(item.description || '');
  setLevelDescription1(item.levelDescription1 || '');
  setLevelDescription2(item.levelDescription2 || '');
  setLevelDescription3(item.levelDescription3 || '');
  setLevelDescription4(item.levelDescription4 || '');
  setReferensi(item.reference || '');
  setStatus(item.status === 'active' ? 'Active' : 'Inactive');
  setUrutan(String(item.sortOrder ?? ''));

}, [data, variableId]);
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

  let payload: FormData | Record<string, any>;

  if (logoFile) {
    const formData = new FormData();
    formData.append('name', namaVariabel.trim());
    formData.append('weight', (parseFloat(bobot) || 0).toString()); // ✅ .toString()
    formData.append('description', deskripsi.trim());
    formData.append('levelDescription1', levelDescription1.trim());
    formData.append('levelDescription2', levelDescription2.trim());
    formData.append('levelDescription3', levelDescription3.trim());
    formData.append('levelDescription4', levelDescription4.trim());
    formData.append('reference', referensi.trim());
    formData.append('sortOrder', '1'); // ✅ sudah string
    formData.append('status', status.toLowerCase());
    formData.append('sortOrder', urutan.trim());
    formData.append('iconFile', logoFile);

    payload = formData;
  } else {
    payload = {
      name: namaVariabel.trim(),
      weight: parseFloat(bobot) || 0,
      description: deskripsi.trim(),
      levelDescription1: levelDescription1.trim(),
      levelDescription2: levelDescription2.trim(),
      levelDescription3: levelDescription3.trim(),
      levelDescription4: levelDescription4.trim(),
      reference: referensi.trim(),
      status: status.toLowerCase() as 'active' | 'inactive',
      sortOrder: urutan.trim(),
      iconFileId: data.iconFileId,
    };
  }

  try {
    await update(variableId, payload);
    router.push('/transformation-variable');
  } catch (err) {
    console.error('❌ Update gagal:', err);
    alert('Gagal menyimpan perubahan. Coba lagi.');
  }
};
  // 🖼️ Handle Upload Logo (hanya preview)
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Ukuran file maksimal 1 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBatal = () => {
    router.back();
  };

  return (
  <div key={variableId} className="flex ">
      <main className="flex-1">
        <div className="p-8  mx-auto">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Edit Variabel</h1>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            {/* Nama & Bobot */}
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

            {/* Deskripsi */}
                    
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Masukkan Deskripsi"
              rows={4}
            />
          </div>

            {/* Referensi & Status */}
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <input
                  type="text"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
            </div>

            {/* 🖼️ Upload Logo — Preview Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Variable
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadLogo}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
              <p className="text-xs text-gray-500 mt-1">Maksimal 1 MB, format: JPG/PNG</p>

              {logoPreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Preview Logo:</p>
                  <img
                    src={logoPreview}
                    alt="Preview Logo"
                    className="mt-1 w-16 h-16 object-contain border rounded"
                  />
                </div>
              )}
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Very Low Maturity
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription1}
              onChange={(e) => setLevelDescription1(e.target.value)}
              placeholder="Masukkan Level Deskripsi"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Low Maturity
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription2}
              onChange={(e) => setLevelDescription2(e.target.value)}
              placeholder="Masukkan Level Deskripsi"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Medium Maturity
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription3}
              onChange={(e) => setLevelDescription3(e.target.value)}
              placeholder="Masukkan Level Deskripsi"
              rows={4}
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             High Maturity
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription4}
              onChange={(e) => setLevelDescription4(e.target.value)}
              placeholder="Masukkan Deskripsi"
              rows={4}
            />
          </div>
          </div>

          <div className="p-8 flex justify-end gap-4 border-t border-gray-200">
            <Button
              variant="ghost"
              icon={X}
              iconColor="text-red-700"
              iconPosition="left"
              onClick={handleBatal}
              disabled={updating}
              className="rounded-[12px] px-11 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              disabled={updating}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold text-white "
            >
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
      </div>
      </main>
      </div>
  );
}
