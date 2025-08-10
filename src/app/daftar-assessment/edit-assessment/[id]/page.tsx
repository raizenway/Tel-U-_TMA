// app/edit/[id]/page.tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';
import Button from '@/components/button';

export default function EditAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();

  // Form state (tanpa logo)
  const [form, setForm] = useState({
    namaVariabel: '',
    bobot: '',
    pertanyaan: '',
    deskripsi: '',
    referensi: '',
    tipeSoal: '',
    status: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tipeSoalOptions = [
    'Pilihan Jawaban',
    'API dari iGracias',
    'Submit Jawaban Excel',
  ];

  // Ambil data dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('assessmentList');
    if (!saved) {
      alert('Tidak ada data tersimpan');
      router.push('/daftar-assessment');
      return;
    }

    const list = JSON.parse(saved);
    const item = list.find((item: any) => item.nomor === Number(id));

    if (!item) {
      alert('Data tidak ditemukan');
      router.push('/daftar-assessment');
      return;
    }

    // 🔁 Redirect ke halaman spesifik berdasarkan tipe soal
    if (item.tipeSoal === 'API dari iGracias') {
      localStorage.setItem('editData', JSON.stringify(item));
      router.push('/daftar-assessment/api-igracias');
      return;
    }

    if (item.tipeSoal === 'Pilihan Jawaban') {
      localStorage.setItem('editData', JSON.stringify(item));
      router.push('/daftar-assessment/pilih-jawaban');
      return;
    }

    if (item.tipeSoal === 'Submit Jawaban Excel') {
      localStorage.setItem('editData', JSON.stringify(item));
      router.push('/daftar-assessment/submit-excel');
      return;
    }

    // ❌ Jika tipe soal tidak dikenali, isi form umum
    setForm({
      namaVariabel: item.variable || '',
      bobot: String(item.bobot || ''),
      pertanyaan: item.pertanyaan || '',
      deskripsi: item.indikator || '',
      referensi: item.referensi || '',
      tipeSoal: item.tipeSoal || '',
      status: item.status === 'Active' ? 'active' : 'inactive',
    });
  }, [id, router]);

  // Ubah nilai form
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validasi form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!form.pertanyaan.trim()) newErrors.pertanyaan = 'Wajib diisi';
    if (!form.tipeSoal) newErrors.tipeSoal = 'Wajib dipilih';
    if (!form.status) newErrors.status = 'Wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simpan perubahan
  const handleSave = () => {
    if (!validate()) {
      alert('Mohon lengkapi semua field yang wajib.');
      return;
    }

    const saved = localStorage.getItem('assessmentList');
    if (!saved) return;

    const list = JSON.parse(saved);
    const updated = list.map((item: any) =>
      item.nomor === Number(id)
        ? {
            ...item,
            variable: form.namaVariabel,
            bobot: Number(form.bobot) || 1,
            pertanyaan: form.pertanyaan,
            indikator: form.deskripsi,
            referensi: form.referensi,
            tipeSoal: form.tipeSoal,
            status: form.status === 'active' ? 'Active' : 'Inactive',
          }
        : item
    );

    localStorage.setItem('assessmentList', JSON.stringify(updated));
    alert('Data berhasil diperbarui!');
    router.push('/daftar-assessment');
  };

  // Batal
  const handleCancel = () => {
    router.push('/daftar-assessment');
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
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-20">
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
                    className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={form.namaVariabel}
                    onChange={(e) => handleChange('namaVariabel', e.target.value)}
                  />
                  {errors.namaVariabel && <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bobot</label>
                  <input
                    type="number"
                    className={`w-full border ${errors.bobot ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={form.bobot}
                    onChange={(e) => handleChange('bobot', e.target.value)}
                  />
                  {errors.bobot && <p className="text-red-500 text-xs mt-1">{errors.bobot}</p>}
                </div>
              </div>

              {/* Pertanyaan & Deskripsi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                  <textarea
                    className={`w-full border ${errors.pertanyaan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={4}
                    value={form.pertanyaan}
                    onChange={(e) => handleChange('pertanyaan', e.target.value)}
                  ></textarea>
                  {errors.pertanyaan && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan}</p>}
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
                    className={`w-full border ${errors.tipeSoal ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  {errors.tipeSoal && <p className="text-red-500 text-xs mt-1">{errors.tipeSoal}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="">Pilih Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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