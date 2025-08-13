'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/button';
import { X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TambahPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [referensi, setReferensi] = useState('');
  const [status, setStatus] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Cek apakah sedang dalam mode edit
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // State untuk mengatur tombol simpan aktif/tidak
  const [isFormValid, setIsFormValid] = useState(false);

  // Cek kelengkapan form setiap kali state berubah
  useEffect(() => {
    if (
      namaVariabel.trim() &&
      bobot.trim() &&
      pertanyaan.trim() &&
      deskripsi.trim() &&
      referensi.trim() &&
      status
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [namaVariabel, bobot, pertanyaan, deskripsi, referensi, status]);

  // Load data jika mode edit
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (editData) {
      const parsed = JSON.parse(editData);
      setNamaVariabel(parsed.namaVariabel || '');
      setBobot(parsed.bobot?.toString() || '');
      setPertanyaan(parsed.pertanyaan || '');
      setDeskripsi(parsed.deskripsi || '');
      setReferensi(parsed.referensi || '');
      setStatus(parsed.status || '');
      setLogoPreview(parsed.logoUrl || '/logo-telu.png');
      setEditId(parsed.id);
      setIsEdit(true);
    }
  }, []);

  // Handle upload file + preview
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

  // Simpan data
  const handleSimpan = () => {
    const newRow = {
      id: editId || Date.now(),
      namaVariabel,
      variable: namaVariabel,
      bobot: parseFloat(bobot),
      pertanyaan,
      deskripsi,
      referensi,
      status,
      logoFileName: logoFile?.name || 'no-logo.png',
      logoUrl: logoPreview || '/logo-telu.png',
    };

    const saved = localStorage.getItem('transformationVariables');
    const arr = saved ? JSON.parse(saved) : [];

    if (isEdit && editId !== null) {
      const updated = arr.map((item: any) =>
        item.id === editId ? newRow : item
      );
      localStorage.setItem('transformationVariables', JSON.stringify(updated));
      alert('Data berhasil diperbarui!');
    } else {
      arr.push(newRow);
      localStorage.setItem('transformationVariables', JSON.stringify(arr));
      alert('Data berhasil ditambahkan!');
    }

    localStorage.removeItem('editData');
    router.push('/transformation-variable');
  };

  // Batal
  const handleBatal = () => {
    setNamaVariabel('');
    setBobot('');
    setPertanyaan('');
    setDeskripsi('');
    setReferensi('');
    setStatus('');
    setLogoFile(null);
    setLogoPreview(null);
    localStorage.removeItem('editData');
    router.push('/transformation-variable');
  };

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white rounded-xl shadow-md mx-auto"
          style={{ width: '1100px', minHeight: '650px', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit' : 'Tambah'} Variabel
            </h1>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            {/* Nama Variabel & Bobot */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={namaVariabel}
                  onChange={(e) => setNamaVariabel(e.target.value)}
                  placeholder="Masukkan Nama Variabel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bobot</label>
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

            {/* Pertanyaan & Deskripsi */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Masukkan Pertanyaan"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Masukkan Deskripsi"
                  rows={4}
                />
              </div>
            </div>

            {/* Referensi & Status */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referensi</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={referensi}
                  onChange={(e) => setReferensi(e.target.value)}
                  placeholder="Masukkan Referensi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Active">Deractive</option>
                  <option value="Inactive">Reactive</option>
                </select>
              </div>
            </div>

            {/* Upload Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo UPPS/KC</label>
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
          </div>

          {/* Footer Buttons */}
          <div className="p-8 border-t bg-gray-50 flex justify-end gap-4">
            <Button
              variant="ghost"
              icon={X}
              iconPosition="left"
              onClick={handleBatal}
              className="rounded-[12px] px-15 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              disabled={!isFormValid}
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              className={`rounded-[12px] px-16 py-2 text-sm font-semibold text-white ${
                isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
              }`}
            >
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
