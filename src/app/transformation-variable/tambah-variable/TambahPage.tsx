'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/button';
import { X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';


// 🔹 Impor hook untuk create dan update
import { useCreateTransformationVariable } from '@/hooks/useTransformationVariableList';
import { useUpdateTransformationVariable } from '@/hooks/useTransformationVariableList';
import { CreateTransformationVariableRequest as CreateRequest } from '@/interfaces/transformation-variable';

export default function VariabelFormPage() {
  const router = useRouter();

  // State form
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [levelDescription1, setLevelDescription1] = useState('');
  const [levelDescription2, setLevelDescription2] = useState('');
  const [levelDescription3, setLevelDescription3] = useState('');
  const [levelDescription4, setLevelDescription4] = useState('');
  const [referensi, setReferensi] = useState('');
  const [status, setStatus] = useState('');
  const [urutan, setUrutan] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Mode edit
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Validasi form
  const [isFormValid, setIsFormValid] = useState(false);

  // Hook untuk create dan update
  const { mutate: create, loading: creating } = useCreateTransformationVariable();
  const { mutate: update, loading: updating } = useUpdateTransformationVariable();

  const loading = creating || updating; // Loading global

  // Validasi otomatis
  useEffect(() => {
    setIsFormValid(
      !!(namaVariabel.trim() &&
        bobot.trim() &&
        deskripsi.trim() &&
        levelDescription1.trim() &&
        levelDescription2.trim() &&
        levelDescription3.trim() &&
        levelDescription4.trim() &&
        referensi.trim() &&
        urutan.trim() &&
        status)
    );
  }, [namaVariabel, bobot,  deskripsi, levelDescription1, levelDescription2, levelDescription3, levelDescription4, referensi, urutan, status]);

  // Prefill jika mode edit
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const editData = localStorage.getItem('editData');
    if (!editData) return;

    try {
      const parsed = JSON.parse(editData);

      setNamaVariabel(parsed.name || parsed.namaVariabel || '');
      setBobot(parsed.weight?.toString() || '');
      setDeskripsi(parsed.description || parsed.deskripsi || '');
      setLevelDescription1(parsed.levelDescription1 || parsed.levelDescription1 || ''); 
      setLevelDescription2(parsed.levelDescription2 || parsed.levelDescription2 || ''); 
      setLevelDescription3(parsed.levelDescription3 || parsed.levelDescription3 || ''); 
      setLevelDescription4(parsed.levelDescription4 || parsed.levelDescription4 || ''); 
      setReferensi(parsed.reference || parsed.referensi || '');
      setUrutan(parsed.sortOrder || parsed.urutan || '');

      const parsedStatus = typeof parsed.status === 'string' ? parsed.status.toLowerCase() : '';

      if (parsedStatus === 'active' || parsedStatus === 'aktif') {
        setStatus('Active');
      } else if (parsedStatus === 'inactive' || parsedStatus === 'non-aktif') {
        setStatus('Inactive');
      } else {
        setStatus('');
      }

      setLogoPreview(parsed.logoUrl || '/logo-telu.png');
      setEditId(parsed.id ?? null);
      setIsEdit(true);
    } catch (err) {
      console.error('Gagal parse editData:', err);
    }
  }, []);

  // Upload logo
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

  // Simpan data ke API (create atau update)
  const handleSimpan = async () => {
  if (!isFormValid) {
    alert('Mohon lengkapi semua field wajib.');
    return;
  }

  const formData = new FormData();
  formData.append('name', namaVariabel.trim());
  formData.append('weight', bobot);
  formData.append('description', deskripsi.trim());
  formData.append('levelDescription1', levelDescription1.trim());
  formData.append('levelDescription2', levelDescription2.trim());
  formData.append('levelDescription3', levelDescription3.trim());
  formData.append('levelDescription4', levelDescription4.trim());
  formData.append('reference', referensi.trim());
  formData.append('sortOrder', urutan.trim());
  formData.append('status', status.toLowerCase());

  // 🔥 Kirim file dengan field "icon" — SESUAI POSTMAN!
  if (logoFile) {
    formData.append('icon', logoFile);
  }

  try {
    if (isEdit && editId) {
      // Pastikan hook update terima FormData
      await update(editId, formData);
    } else {
      // Pastikan hook create terima FormData
      await create(formData);
    }

    localStorage.removeItem('editData');
    router.push('/transformation-variable?success=true');
  } catch (err) {
    console.error('Gagal menyimpan ', err);
    alert('Gagal menyimpan data.');
  }
};
  // Batal
  const handleBatal = () => {
    
      localStorage.removeItem('editData');
      router.push('/transformation-variable');
    
  };

  return (
    <div className="flex ">
      <main className="flex-1">
        <div className="p-8  mx-auto">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit' : 'Tambah'} 
            </h1>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Variabel
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={namaVariabel}
                  onChange={(e) => setNamaVariabel(e.target.value)}
                  placeholder="Masukkan Nama Variabel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bobot
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={bobot}
                  onChange={(e) => setBobot(e.target.value)}
                  placeholder="0.0 - 1.0"
                />
              </div>
            </div>

            
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

            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referensi
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={referensi}
                  onChange={(e) => setReferensi(e.target.value)}
                  placeholder="Masukkan Referensi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Non-Aktif</option>
                </select>
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  placeholder="Masukkan Urutan"
                />
              </div>

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
             Level Deskripsi 1
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription1}
              onChange={(e) => setLevelDescription1(e.target.value)}
              placeholder="Masukkan Level Deskripsi 1"
              rows={4}
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Level Deskripsi 2
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription2}
              onChange={(e) => setLevelDescription2(e.target.value)}
              placeholder="Masukkan Level Deskripsi 2"
              rows={4}
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Level Deskripsi 3
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription3}
              onChange={(e) => setLevelDescription3(e.target.value)}
              placeholder="Masukkan Level Deskripsi 3"
              rows={4}
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
             Level Deskripsi 4
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              value={levelDescription4}
              onChange={(e) => setLevelDescription4(e.target.value)}
              placeholder="Masukkan Level Deskripsi 4"
              rows={4}
            />
          </div>
          </div>

          
          <div className="p-8 flex justify-end gap-4">
            <Button
              variant="ghost"
              icon={X}
              iconColor="text-red-200"
              iconPosition="left"
              onClick={handleBatal}
              disabled={loading}
              className="rounded-[12px] px-15 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              disabled={!isFormValid || loading}
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              className={`rounded-[12px] px-10 py-2 text-sm font-semibold text-white ${
                isFormValid && !loading ? '' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
            </div>
          </div>
        </main>
      </div>
  );
}
