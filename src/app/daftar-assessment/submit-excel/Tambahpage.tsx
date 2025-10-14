'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Button from '@/components/button';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import TableUpdate from '@/components/TableUpdate';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/useDaftarAssessment';

// Interface untuk preview
interface AssessmentItem {
  nomor: number;
  variable: string;
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

type StatusInput = 'Aktif' | 'Non-Aktif';

export default function SubmitExcelPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<AssessmentItem[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hook API
  const { mutate: createMutate } = useCreateQuestion();
  const { mutate: updateMutate } = useUpdateQuestion();

  // Load edit data
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (!editData) {
      setIsEditMode(false);
      setEditNomor(null);
      return;
    }

    try {
      const data = JSON.parse(editData);
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      if (data.nomor !== undefined && data.nomor !== null) {
        setEditNomor(data.nomor);
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
      localStorage.removeItem('editData');
    }
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.removeItem('editData');
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assessment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setPreviewData([]);
      setIsPreviewOpen(false);
    } else {
      alert('Harap pilih file Excel (.xlsx atau .xls)');
      e.target.value = '';
    }
  };

  const handlePreview = () => {
    if (!file || !status) {
      alert('Harap unggah file dan pilih status terlebih dahulu.');
      return;
    }

    if (isPreviewOpen) {
      setIsPreviewOpen(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) throw new Error('File tidak memiliki data.');

        const headers = json[0] as string[];
        const rows = json.slice(1);

        const requiredColumns = [
          'Variable', 'Indikator', 'Pertanyaan',
          'Deskripsi Skor 0', 'Deskripsi Skor 1', 'Deskripsi Skor 2',
          'Deskripsi Skor 3', 'Deskripsi Skor 4', 'Referensi'
        ];

        const missing = requiredColumns.filter(col => !headers.includes(col));
        if (missing.length > 0) {
          alert(`Kolom tidak ditemukan: ${missing.join(', ')}`);
          return;
        }

        const idx = (col: string) => headers.indexOf(col);
        const finalStatus: 'Active' | 'Inactive' = status === 'Aktif' ? 'Active' : 'Inactive';

        const items = rows.map((row: any, i) => {
          const referensiVal = row[idx('Referensi')];
          const urutan = isNaN(Number(referensiVal)) ? i + 1 : Number(referensiVal);

          return {
            nomor: i + 1,
            variable: row[idx('Variable')]?.toString().trim() || '—',
            indikator: row[idx('Indikator')]?.toString().trim() || '—',
            pertanyaan: row[idx('Pertanyaan')]?.toString().trim() || '—',
            tipeSoal: 'Submit Jawaban Excel',
            status: finalStatus,
            deskripsiSkor0: row[idx('Deskripsi Skor 0')]?.toString().trim() || '—',
            deskripsiSkor1: row[idx('Deskripsi Skor 1')]?.toString().trim() || '—',
            deskripsiSkor2: row[idx('Deskripsi Skor 2')]?.toString().trim() || '—',
            deskripsiSkor3: row[idx('Deskripsi Skor 3')]?.toString().trim() || '—',
            deskripsiSkor4: row[idx('Deskripsi Skor 4')]?.toString().trim() || '—',
            urutan,
          };
        });

        setPreviewData(items);
        setIsPreviewOpen(true);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format benar.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSimpan = async () => {
    setSubmitError(null);
    if (!file || !status) {
      alert('Harap unggah file dan pilih status.');
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) throw new Error('File tidak memiliki data.');

        const headers = json[0] as string[];
        const rows = json.slice(1);

        if (isEditMode && rows.length !== 1) {
          alert('Dalam mode edit, hanya boleh ada 1 baris data.');
          setLoading(false);
          return;
        }

        const idx = (col: string) => headers.indexOf(col);
        const finalStatus = status === 'Aktif' ? 'active' : 'inactive';

        // Ambil transformationVariableId dari localStorage (jika ada)
        // Jika tidak ada, gunakan default (misal: 1)
        const editData = localStorage.getItem('editData');
        const transformationVariableId = editData
          ? JSON.parse(editData).transformationVariableId
          : 1; // Ganti sesuai kebutuhan

        for (const row of rows) {
          const referensiVal = row[idx('Referensi')];
          const order = isNaN(Number(referensiVal)) ? 1 : Number(referensiVal);
            const finalStatus: 'active' | 'inactive' = status === 'Aktif' ? 'active' : 'inactive'

          const payload = {
            transformationVariable: { connect: { id: transformationVariableId } },
            type: 'excel',
            indicator: row[idx('Indikator')]?.toString().trim() || '',
            questionText: row[idx('Pertanyaan')]?.toString().trim() || '',
            answerText1: "",
            answerText2: "",
            answerText3: "",
            answerText4: "",
            answerText5: "",
            scoreDescription0: row[idx('Deskripsi Skor 0')]?.toString().trim() || '',
            scoreDescription1: row[idx('Deskripsi Skor 1')]?.toString().trim() || '',
            scoreDescription2: row[idx('Deskripsi Skor 2')]?.toString().trim() || '',
            scoreDescription3: row[idx('Deskripsi Skor 3')]?.toString().trim() || '',
            scoreDescription4: row[idx('Deskripsi Skor 4')]?.toString().trim() || '',
            order,
            status: finalStatus,
          };

          if (isEditMode && editNomor) {
            await updateMutate(editNomor, payload);
          } else {
            await createMutate(payload);
          }
        }

        localStorage.removeItem('editData');
        router.push('/daftar-assessment');
      } catch (err: any) {
        setSubmitError(err.message || 'Gagal menyimpan data ke database.');
        console.error(err);
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

  const previewColumns = [
    { header: 'No', key: 'nomor', width: '60px', className: 'text-center' },
    { header: 'Variable', key: 'variable', width: '150px' },
    { header: 'Indikator', key: 'indikator', width: '200px' },
    { header: 'Pertanyaan', key: 'pertanyaan', width: '200px' },
    { header: 'Deskripsi Skor 0', key: 'deskripsiSkor0', width: '150px' },
    { header: 'Deskripsi Skor 1', key: 'deskripsiSkor1', width: '150px' },
    { header: 'Deskripsi Skor 2', key: 'deskripsiSkor2', width: '150px' },
    { header: 'Deskripsi Skor 3', key: 'deskripsiSkor3', width: '150px' },
    { header: 'Deskripsi Skor 4', key: 'deskripsiSkor4', width: '150px' },
    { header: 'Urutan', key: 'urutan', width: '80px', className: 'text-center' },
    { header: 'Status', key: 'status', width: '100px', className: 'text-center' },
  ];

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <div className="p-8 rounded-xl shadow-md mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditMode ? 'Edit Soal: Submit Jawaban Excel' : 'Soal Baru: Submit Jawaban Excel'}
          </h1>

          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              ❌ {submitError}
            </div>
          )}

          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <p>Download template Excel, isi, lalu upload di bawah.</p>
          </div>

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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              onChange={handleFileChange}
            />
            {file && <p className="text-sm text-green-600 mt-1">✅ {file.name}</p>}
          </div>

          <a
            href="/template-assessment.xlsx"
            download
            className="inline-block text-blue-500 hover:text-blue-700 mb-6"
          >
            📥 Download Template Excel
          </a>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              icon={isPreviewOpen ? EyeOff : Eye}
              onClick={handlePreview}
              disabled={!file || !status}
            >
              {isPreviewOpen ? 'Tutup Preview' : 'Preview'}
            </Button>
            <Button variant="ghost" icon={X} onClick={handleCancel}>
              Batal
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSimpan}
              disabled={!file || !status || loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>

          {isPreviewOpen && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Preview Data ({previewData.length} baris)</h3>
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