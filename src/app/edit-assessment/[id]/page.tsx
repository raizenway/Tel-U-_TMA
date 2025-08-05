'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';
import Button from '@/components/button'; // Pastikan komponen Button ada

export default function EditAssessmentPage() {
  const { id } = useParams(); // Misal: /edit-assessment/1
  const router = useRouter();
  const [form, setForm] = useState({
    namaVariabel: '',
    bobot: '',
    pertanyaan: '',
    deskripsi: '',
    referensi: '',
    tipeSoal: '', // 🔴 Ditambahkan: Tipe Soal
    status: '',
    logoUrl: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Daftar opsi tipe soal (harus sesuai dengan AssessmentPage)
  const tipeSoalOptions = [
    'Pilihan Jawaban',
    'API dari iGracias',
    'Submit Jawaban Excel',
  ];

  // Ambil data dari localStorage berdasarkan id
  useEffect(() => {
    const saved = localStorage.getItem('assessmentList');
    if (saved) {
      const list = JSON.parse(saved);
      const item = list.find((item: any) => item.nomor === Number(id));
      if (item) {
        setForm({
          namaVariabel: item.variable || '',
          bobot: String(item.bobot || ''),
          pertanyaan: item.pertanyaan || '',
          deskripsi: item.indikator || '',
          referensi: item.referensi || '',
          tipeSoal: item.tipeSoal || '', // ✅ Muat tipe soal
          status: item.status === 'Active' ? 'active' : 'inactive',
          logoUrl: item.logoUrl || '',
        });
        setLogoPreview(item.logoUrl || '');
      } else {
        alert('Data tidak ditemukan');
        router.push('/daftar-assessment');
      }
    } else {
      alert('Tidak ada data tersimpan');
      router.push('/daftar-assessment');
    }
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert('File tidak boleh lebih dari 1 MB');
        return;
      }
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setForm((prev) => ({ ...prev, logoUrl: url }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.namaVariabel || !form.pertanyaan || !form.tipeSoal || !form.status) {
      alert('Harap isi Nama Variabel, Pertanyaan, Tipe Soal, dan Status');
      return;
    }
    const saved = localStorage.getItem('assessmentList');
    if (saved) {
      const list = JSON.parse(saved);
      const updated = list.map((item: any) =>
        item.nomor === Number(id)
          ? {
              ...item,
              variable: form.namaVariabel,
              bobot: Number(form.bobot) || 0,
              pertanyaan: form.pertanyaan,
              indikator: form.deskripsi,
              referensi: form.referensi,
              tipeSoal: form.tipeSoal, // ✅ Simpan tipe soal
              status: form.status === 'active' ? 'Active' : 'Inactive',
              logoUrl: logoPreview || item.logoUrl,
            }
          : item
      );
      localStorage.setItem('assessmentList', JSON.stringify(updated));
    }
    alert('Data berhasil diperbarui!');
    router.push('/daftar-assessment');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onItemClick={(item) => router.push(`/${item.path}`)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <TopbarHeader />

        {/* Page Content */}
        <main className="p-6 bg-gray-100 flex-1">
          <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-800">Edit Assessment #{id}</h1>
              <p className="text-sm text-gray-600 mt-1">Perbarui data assessment di bawah ini</p>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6">
              {/* Nama Variabel & Bobot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.namaVariabel}
                    onChange={(e) => handleChange('namaVariabel', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bobot</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.bobot}
                    onChange={(e) => handleChange('bobot', e.target.value)}
                  />
                </div>
              </div>

              {/* Pertanyaan & Deskripsi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={form.pertanyaan}
                    onChange={(e) => handleChange('pertanyaan', e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => handleChange('deskripsi', e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Referensi & Tipe Soal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referensi</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.referensi}
                    onChange={(e) => handleChange('referensi', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.tipeSoal}
                    onChange={(e) => handleChange('tipeSoal', e.target.value)}
                  >
                    <option value="">Pilih Tipe Soal</option>
                    {tipeSoalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Logo UPPS/KC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo UPPS/KC</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]');
                      if (input instanceof HTMLInputElement) {
                        input.click();
                      }
                    }}
                  >
                    Upload
                  </Button>
                </div>
                {logoPreview && (
                  <div className="mt-3">
                    <img src={logoPreview} alt="Preview Logo" className="h-16 object-contain border rounded" />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Maksimal file 1 MB</p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="secondary" onClick={handleCancel}>
                  Batal
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}