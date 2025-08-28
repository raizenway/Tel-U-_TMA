'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Button from '@/components/button';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import TableUpdate from '@/components/TableUpdate';

// Interface untuk data assessment
interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  pertanyaan: string;
  tipeSoal: string;
  status: 'Active' | 'Inactive';
  deskripsiSkor0: string;
  deskripsiSkor1: string;
  deskripsiSkor2: string;
  deskripsiSkor3: string;
  deskripsiSkor4: string;
  urutan: number;
}

// Type untuk status input (UI)
type StatusInput = 'Aktif' | 'Non-Aktif';

export default function SubmitExcelPage() {
  const router = useRouter();

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [loading, setLoading] = useState(false);

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // 🔍 Preview state
  const [previewData, setPreviewData] = useState<AssessmentItem[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Toggle preview

  // Load data dari editData
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (!editData) return;

    try {
      const data = JSON.parse(editData);
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setEditNomor(data.nomor ?? null);
      if (data.nomor !== undefined && data.nomor !== null && data.nomor !== '') {
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
    }
  }, []);

  // Redirect otomatis saat ganti tipe soal
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assessment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  // Upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setPreviewData([]); // Reset preview
      setIsPreviewOpen(false); // Tutup preview saat ganti file
    } else {
      alert('Harap pilih file Excel (.xlsx atau .xls)');
      e.target.value = ''; // reset input
    }
  };

  // 🔍 Fungsi Preview (Toggle)
  const handlePreview = () => {
    if (!file) {
      alert('Harap unggah file Excel terlebih dahulu.');
      return;
    }
    if (!status) {
      alert('Harap pilih status terlebih dahulu.');
      return;
    }

    // Jika sudah terbuka, tutup
    if (isPreviewOpen) {
      setIsPreviewOpen(false);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => alert('Gagal membaca file. File mungkin rusak.');

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File tidak terbaca');

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error('Sheet tidak ditemukan');

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          alert('File Excel tidak memiliki data.');
          return;
        }

        const headers = json[0] as string[];
        const rows = json.slice(1);

        // Validasi kolom wajib
        const requiredColumns = [
          'Variable',
          'Indikator',
          'Pertanyaan',
          'Deskripsi Skor 0',
          'Deskripsi Skor 1',
          'Deskripsi Skor 2',
          'Deskripsi Skor 3',
          'Deskripsi Skor 4',
          'Urutan',
        ];

        const missingColumns = requiredColumns.filter((col) => {
          const idx = headers.indexOf(col);
          return idx === -1;
        });

        if (missingColumns.length > 0) {
          alert(`Kolom berikut tidak ditemukan:\n${missingColumns.join(', ')}\n\nPastikan template Excel digunakan dengan benar.`);
          return;
        }

        // Ambil indeks
        const variableIdx = headers.indexOf('Variable');
        const indikatorIdx = headers.indexOf('Indikator');
        const pertanyaanIdx = headers.indexOf('Pertanyaan');
        const deskripsi0Idx = headers.indexOf('Deskripsi Skor 0');
        const deskripsi1Idx = headers.indexOf('Deskripsi Skor 1');
        const deskripsi2Idx = headers.indexOf('Deskripsi Skor 2');
        const deskripsi3Idx = headers.indexOf('Deskripsi Skor 3');
        const deskripsi4Idx = headers.indexOf('Deskripsi Skor 4');
        const urutanIdx = headers.indexOf('Urutan');

        // Konversi status
        const finalStatus: 'Active' | 'Inactive' = status === 'Aktif' ? 'Active' : 'Inactive';

        // Konversi baris ke objek
        const previewItems: AssessmentItem[] = rows.map((row: any, index: number) => ({
          nomor: index + 1,
          variable: row[variableIdx]?.toString().trim() || 'Tidak tersedia',
          bobot: 1,
          indikator: row[indikatorIdx]?.toString().trim() || 'Tidak tersedia',
          pertanyaan: row[pertanyaanIdx]?.toString().trim() || 'Tidak tersedia',
          tipeSoal: 'Submit Jawaban Excel',
          status: finalStatus,
          deskripsiSkor0: row[deskripsi0Idx]?.toString().trim() || 'Tidak ada deskripsi',
          deskripsiSkor1: row[deskripsi1Idx]?.toString().trim() || 'Tidak ada deskripsi',
          deskripsiSkor2: row[deskripsi2Idx]?.toString().trim() || 'Tidak ada deskripsi',
          deskripsiSkor3: row[deskripsi3Idx]?.toString().trim() || 'Tidak ada deskripsi',
          deskripsiSkor4: row[deskripsi4Idx]?.toString().trim() || 'Tidak ada deskripsi',
          urutan: parseInt(row[urutanIdx], 10) || 1,
        }));

        setPreviewData(previewItems);
        setIsPreviewOpen(true); // Buka preview setelah sukses
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Terjadi kesalahan saat membaca file Excel. Pastikan formatnya benar.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Simpan data dari Excel
  const handleSimpan = () => {
    if (!file) {
      alert('Harap unggah file Excel terlebih dahulu.');
      return;
    }
    if (!status) {
      alert('Harap pilih status terlebih dahulu.');
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      alert('Gagal membaca file. File mungkin rusak.');
      setLoading(false);
    };

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File tidak terbaca');

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error('Sheet tidak ditemukan');

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
          alert('File Excel tidak memiliki data.');
          setLoading(false);
          return;
        }

        const headers = json[0] as string[];
        const rows = json.slice(1);

        // Validasi: hanya 1 baris saat edit
        if (isEditMode && rows.length !== 1) {
          alert('Dalam mode edit, hanya boleh ada 1 baris data.');
          setLoading(false);
          return;
        }

        // Ambil indeks kolom — sesuai template
        const variableIdx = headers.indexOf('Variable');
        const indikatorIdx = headers.indexOf('Indikator');
        const pertanyaanIdx = headers.indexOf('Pertanyaan');
        const deskripsi0Idx = headers.indexOf('Deskripsi Skor 0');
        const deskripsi1Idx = headers.indexOf('Deskripsi Skor 1');
        const deskripsi2Idx = headers.indexOf('Deskripsi Skor 2');
        const deskripsi3Idx = headers.indexOf('Deskripsi Skor 3');
        const deskripsi4Idx = headers.indexOf('Deskripsi Skor 4');
        const urutanIdx = headers.indexOf('Urutan');

        // Validasi kolom wajib
        const requiredColumns = [
          'Variable',
          'Indikator',
          'Pertanyaan',
          'Deskripsi Skor 0',
          'Deskripsi Skor 1',
          'Deskripsi Skor 2',
          'Deskripsi Skor 3',
          'Deskripsi Skor 4',
          'Urutan',
        ];

        const missingColumns = requiredColumns.filter((col) => {
          const idx = headers.indexOf(col);
          return idx === -1;
        });

        if (missingColumns.length > 0) {
          alert(`Kolom berikut tidak ditemukan:\n${missingColumns.join(', ')}\n\nPastikan template Excel digunakan dengan benar.`);
          setLoading(false);
          return;
        }

        // Konversi status UI → status data
        const finalStatus: 'Active' | 'Inactive' = status === 'Aktif' ? 'Active' : 'Inactive';

        // Ambil data dari localStorage
        const saved = localStorage.getItem('assessmentList');
        const list: AssessmentItem[] = saved ? JSON.parse(saved) : [];

        // Hitung nomor terakhir
        const lastNomor = list.length > 0 ? Math.max(...list.map((i) => i.nomor)) : 0;

        // Konversi baris ke objek
        const importedItems: AssessmentItem[] = rows
          .map((row: any, index: number) => {
            const nomor = isEditMode && editNomor !== null ? editNomor : lastNomor + index + 1;
            const urutanVal = parseInt(row[urutanIdx], 10);
            return {
              nomor,
              variable: row[variableIdx]?.toString().trim() || 'Variable tidak tersedia',
              bobot: 1,
              indikator: row[indikatorIdx]?.toString().trim() || 'Indikator tidak tersedia',
              pertanyaan: row[pertanyaanIdx]?.toString().trim() || 'Pertanyaan tidak tersedia',
              tipeSoal: 'Submit Jawaban Excel',
              status: finalStatus,
              deskripsiSkor0: row[deskripsi0Idx]?.toString().trim() || 'Tidak ada deskripsi',
              deskripsiSkor1: row[deskripsi1Idx]?.toString().trim() || 'Tidak ada deskripsi',
              deskripsiSkor2: row[deskripsi2Idx]?.toString().trim() || 'Tidak ada deskripsi',
              deskripsiSkor3: row[deskripsi3Idx]?.toString().trim() || 'Tidak ada deskripsi',
              deskripsiSkor4: row[deskripsi4Idx]?.toString().trim() || 'Tidak ada deskripsi',
              urutan: isNaN(urutanVal) ? 1 : urutanVal,
            };
          })
          .filter((item) => item.variable && item.indikator && item.pertanyaan);

        if (importedItems.length === 0) {
          alert('Tidak ada data valid yang ditemukan di file Excel.');
          setLoading(false);
          return;
        }

        // Update atau tambah data
        const updatedList = isEditMode && editNomor !== null
          ? list.map((item) =>
              item.nomor === editNomor ? { ...item, ...importedItems[0] } : item
            )
          : [...list, ...importedItems];

        // Simpan ke localStorage
        try {
          localStorage.setItem('assessmentList', JSON.stringify(updatedList));
          localStorage.setItem('newDataAdded', 'true');
          localStorage.removeItem('editData');
        } catch (err) {
          alert('Gagal menyimpan data. Storage penuh atau dibatasi.');
          console.error('localStorage error:', err);
          setLoading(false);
          return;
        }

        // Berhasil
        alert(`Data berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'} dari Excel!`);
        router.push('/daftar-assessment');
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Terjadi kesalahan saat membaca file Excel. Pastikan formatnya benar.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

  // 🔽 Kolom untuk preview — SUDAH TERMASUK DESKRIPSI SKOR
  const previewColumns = [
    { header: 'No', key: 'nomor', width: '60px', className: 'text-center', sortable: true },
    { header: 'Variable', key: 'variable', width: '180px', sortable: true },
    { header: 'Indikator', key: 'indikator', width: '200px', sortable: true },
    { header: 'Pertanyaan', key: 'pertanyaan', width: '250px', sortable: true },
    { header: 'Deskripsi Skor 0', key: 'deskripsiSkor0', width: '200px', sortable: true },
    { header: 'Deskripsi Skor 1', key: 'deskripsiSkor1', width: '200px', sortable: true },
    { header: 'Deskripsi Skor 2', key: 'deskripsiSkor2', width: '200px', sortable: true },
    { header: 'Deskripsi Skor 3', key: 'deskripsiSkor3', width: '200px', sortable: true },
    { header: 'Deskripsi Skor 4', key: 'deskripsiSkor4', width: '200px', sortable: true },
    { header: 'Urutan', key: 'urutan', width: '80px', className: 'text-center', sortable: true },
    { header: 'Status', key: 'status', width: '100px', className: 'text-center', sortable: true },
  ];

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto pt-24">
        <div
          className="bg-white p-8 rounded-xl shadow-md mx-auto"
          style={{
            width: '90%',
            maxWidth: '1200px',
            minWidth: '320px',
            minHeight: '500px',
            maxHeight: 'calc(100vh - 140px)',
            marginTop: '60px',
            overflowY: 'auto',
          }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditMode ? 'Edit Soal: Submit Jawaban Excel' : 'Soal Baru: Submit Jawaban Excel'}
          </h1>

          {/* Notifikasi */}
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <p>Silakan download template kuesioner assessment Excel. Kemudian upload hasil</p>
            <p>pengisian di bawah ini.</p>
          </div>

          {/* Type Soal & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type Soal</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                onChange={handleTypeChange}
                defaultValue="submit-excel"
              >
                <option value="">Pilih Type Soal</option>
                <option value="pilihan-jawaban">Pilihan Jawaban</option>
                <option value="api-igracias">API dari iGracias</option>
                <option value="submit-excel">Submit Jawaban Excel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusInput)}
              >
                <option value="">Pilih Status</option>
                <option value="Aktif">Active</option>
                <option value="Non-Aktif">Inactive</option>
              </select>
            </div>
          </div>

          {/* Upload File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  onChange={handleFileChange}
                />
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ File terpilih: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Download Template */}
          <a
            href="/template-assessment.xlsx"
            download
            className="inline-block text-blue-500 hover:text-blue-700 mb-6"
          >
            📥 Download Template Excel
          </a>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              icon={isPreviewOpen ? EyeOff : Eye}
              iconPosition="left"
              onClick={handlePreview}
              disabled={!file || !status}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300"
            >
              {isPreviewOpen ? 'Tutup Preview' : 'Preview'}
            </Button>
            <Button
              variant="ghost"
              icon={X}
              iconPosition="left"
              onClick={handleCancel}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              disabled={!file || !status || loading}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>

          {/* 🔍 Bagian Preview (Toggle) */}
          {isPreviewOpen && previewData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                Preview Data dari Excel
                <span className="ml-2 text-sm font-normal text-gray-500">({previewData.length} baris)</span>
              </h3>
              <div className="overflow-x-auto">
                <TableUpdate
                  columns={previewColumns}
                  data={previewData}
                  currentPage={1}
                  rowsPerPage={10}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}