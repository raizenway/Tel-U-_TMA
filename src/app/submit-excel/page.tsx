'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';

// ✅ Tipe data assessment
interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  pertanyaan: string;
  tipeSoal: string;
  status: 'Active' | 'Inactive';
  [key: string]: any; // fleksibel untuk properti tambahan
}

export default function SubmitExcelPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔁 Redirect otomatis saat ganti tipe soal
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/submit-excel');
    }
  };

  // Upload file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
    } else {
      alert('Harap pilih file Excel (.xlsx atau .xls)');
      e.target.value = ''; // reset input
    }
  };

  // Simpan data dari Excel
  const handleSimpan = () => {
    if (!file) {
      alert('Harap unggah file Excel terlebih dahulu.');
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

        // 🔍 Cek mode edit
        const editDataRaw = localStorage.getItem('editData');
        const isEditMode = !!editDataRaw;
        let editData: AssessmentItem | null = null;

        if (isEditMode) {
          try {
            editData = JSON.parse(editDataRaw!);
            if (!editData || !editData.nomor) {
              alert('Data edit tidak valid: nomor tidak ditemukan.');
              setLoading(false);
              return;
            }
          } catch (err) {
            alert('Data edit rusak. Harap coba lagi.');
            console.error('Parse editData error:', err);
            setLoading(false);
            return;
          }
        }

        // ✅ Validasi: hanya 1 baris saat edit
        if (isEditMode && rows.length !== 1) {
          alert('Dalam mode edit, hanya boleh ada 1 baris data.');
          setLoading(false);
          return;
        }

        // 🔎 Ambil indeks kolom
        const nomorIdx = Math.max(headers.indexOf('Nomor'), 0);
        const variableIdx = Math.max(headers.indexOf('Variable'), 1);
        const bobotIdx = Math.max(headers.indexOf('Bobot'), 2);
        const indikatorIdx = Math.max(headers.indexOf('Indikator'), 3);
        const pertanyaanIdx = Math.max(headers.indexOf('Pertanyaan'), 4);

        // 📦 Ambil data dari localStorage
        const saved = localStorage.getItem('assessmentList');
        let list: AssessmentItem[] = [];
        if (saved) {
          try {
            list = JSON.parse(saved);
            if (!Array.isArray(list)) throw new Error('Format data tidak valid');
          } catch (err) {
            alert('Data lokal rusak.');
            console.error('Parse error:', err);
            setLoading(false);
            return;
          }
        }

        // 🔢 Hitung nomor terakhir
        const lastNomor = list.length > 0 ? Math.max(...list.map((i) => i.nomor)) : 0;

        // 🔄 Konversi baris ke objek
        const importedItems: AssessmentItem[] = rows
          .map((row: any, index: number) => {
            const nomor = isEditMode ? editData!.nomor : lastNomor + index + 1;
            const variable = row[variableIdx] || `V${nomor}`;
            const bobot = Number(row[bobotIdx]) || 1;
            const indikator = row[indikatorIdx] || 'Indikator tidak tersedia';
            const pertanyaan = row[pertanyaanIdx] || 'Pertanyaan tidak tersedia';

            return {
              nomor,
              variable,
              bobot,
              indikator,
              pertanyaan,
              tipeSoal: 'Submit Jawaban Excel',
              status: 'Active' as const,
            };
          })
          .filter((item) => item.variable && item.indikator);

        if (importedItems.length === 0) {
          alert('Tidak ada data valid yang ditemukan di file Excel.');
          setLoading(false);
          return;
        }

        // 📥 Update atau tambah data
        const updatedList = isEditMode && editData
          ? list.map((item) =>
              item.nomor === editData!.nomor ? { ...item, ...importedItems[0] } : item
            )
          : [...list, ...importedItems];

        // 💾 Simpan ke localStorage
        try {
          localStorage.setItem('assessmentList', JSON.stringify(updatedList));
        } catch (err) {
          alert('Gagal menyimpan data. Storage penuh atau dibatasi.');
          console.error('localStorage error:', err);
          setLoading(false);
          return;
        }

        // 🧹 Bersihkan editData jika dalam mode edit
        if (isEditMode) {
          localStorage.removeItem('editData');
        }

        // ✅ Berhasil
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

  return (
    <div className="flex min-h-screen">
      {/* Page Content */}
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Submit Jawaban Excel</h1>

          {/* Notifikasi */}
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <p>Silakan download template kuesioner assessment Excel. Kemudian upload hasil</p>
            <p>pengisian di bawah ini.</p>
          </div>

          {/* Type Soal & Dokumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Dropdown Type Soal */}
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

            {/* Dokumen */}
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
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
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Batal
            </button>
            <button
              type="button"
              onClick={handleSimpan}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}