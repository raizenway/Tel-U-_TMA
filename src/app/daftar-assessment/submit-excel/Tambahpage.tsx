'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Button from '@/components/button';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import TableUpdate from '@/components/TableUpdate';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/useDaftarAssessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';

export type QuestionType = 'text' | 'multitext' | 'api' | 'excel';

interface AssessmentItem {
  nomor: number;
  variable: string;
  indikator: string;
  keyIndicator: string;
  pertanyaan1: string;
  tipeSoal: QuestionType;
  status: 'Active' | 'Inactive';
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

  const { data: variableData } = useTransformationVariableList();
  const { mutate: createMutate } = useCreateQuestion();
  const { mutate: updateMutate } = useUpdateQuestion();

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
    if (selected === 'pilihan-jawaban') router.push('/daftar-assessment/pilih-jawaban');
    else if (selected === 'api-igracias') router.push('/daftar-assessment/api-igracias');
    else if (selected === 'submit-excel') router.push('/daftar-assessment/submit-excel');
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
        const excelData = e.target?.result;
        const workbook = XLSX.read(excelData, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) throw new Error('File tidak memiliki data.');

        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, json.length); i++) {
          const row = json[i] as any[];
          if (row.some(cell => typeof cell === 'string' && cell.includes('Bidang (Variable)'))) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) throw new Error('Header tidak ditemukan.');

        const headers = json[headerRowIdx] as string[];
        const allRows = json.slice(headerRowIdx + 1);

        const getColIndex = (name: string) => headers.findIndex(h => typeof h === 'string' && h.trim() === name);

        const noCol = getColIndex('No');
        const varCol = getColIndex('Bidang (Variable)');
        const keyIndCol = getColIndex('Key Indicator');
        const indCol = getColIndex('Indikator');
        const inputCol = getColIndex('Input');

        if (varCol === -1 || indCol === -1 || inputCol === -1) {
          alert('Kolom wajib tidak ditemukan: Bidang (Variable), Indikator, atau Input.');
          return;
        }

        const finalStatus: 'Active' | 'Inactive' = status === 'Aktif' ? 'Active' : 'Inactive';
        const items: AssessmentItem[] = [];

        for (let i = 0; i < allRows.length; i++) {
          const row = allRows[i];
          const firstCell = row[0];
          if (firstCell === undefined || firstCell === '' || isNaN(Number(firstCell))) {
            continue;
          }

          const nomor = parseInt(firstCell, 10);
          const variable = row[varCol]?.toString().trim() || '—';
          const indikator = row[indCol]?.toString().trim() || '—';
          const keyIndicator = row[keyIndCol]?.toString().trim() || '—';
          const inputVal = row[inputCol]?.toString().trim() || '';

          // Cek apakah baris berikutnya adalah deskripsi PG
          const nextRow = allRows[i + 1];
          const isPGDesc = nextRow && nextRow[inputCol]?.toString().startsWith('a.') && nextRow[inputCol].includes('b.');

          if (isPGDesc) {
            items.push({
              nomor,
              variable,
              indikator,
              keyIndicator,
              pertanyaan1: inputVal,
              tipeSoal: 'multitext',
              status: finalStatus,
              urutan: nomor,
            });
            i++; // skip baris deskripsi
          } else {
            // Ambil sub-pertanyaan (baris tanpa nomor setelahnya)
            let subQuestions = [];
            let j = i + 1;
            while (j < allRows.length && !allRows[j][0]) {
              const subInput = allRows[j][inputCol]?.toString().trim() || '';
              if (subInput) subQuestions.push(subInput);
              j++;
            }
            i = j - 1;

            items.push({
              nomor,
              variable,
              indikator,
              keyIndicator,
              pertanyaan1: inputVal,
              tipeSoal: 'text',
              status: finalStatus,
              urutan: nomor,
            });
          }
        }

        setPreviewData(items);
        setIsPreviewOpen(true);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + (err.message || 'Format tidak sesuai.'));
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
      const excelData = e.target?.result;
      const workbook = XLSX.read(excelData, { type: 'array' });

      // === BACA SOAL DARI SHEET RUMUS ===
      const rumusSheetName = workbook.SheetNames.find(name => name.includes('Rumus'));
      if (!rumusSheetName) throw new Error('Sheet "Rumus" tidak ditemukan.');
      const rumusWorksheet = workbook.Sheets[rumusSheetName];
      const rumusJson = XLSX.utils.sheet_to_json(rumusWorksheet, { header: 1 });
      if (rumusJson.length < 5) throw new Error('Sheet Rumus tidak memiliki data.');

      // Cari header di sheet Rumus
      let rumusHeaderRowIdx = -1;
      for (let i = 0; i < Math.min(20, rumusJson.length); i++) {
        const row = rumusJson[i] as any[];
        if (row.length < 5) continue;
        if (row.some(cell => typeof cell === 'string' && (
          cell.toLowerCase().includes('no') &&
          (cell.toLowerCase().includes('variable') || cell.toLowerCase().includes('bidang'))
        ))) {
          rumusHeaderRowIdx = i;
          break;
        }
      }
      if (rumusHeaderRowIdx === -1) {
        for (let i = 0; i < Math.min(20, rumusJson.length); i++) {
          const row = rumusJson[i] as any[];
          if (row.some(c => typeof c === 'string' && c.toLowerCase().includes('no')) &&
              row.some(c => typeof c === 'string' && c.toLowerCase().includes('input'))) {
            rumusHeaderRowIdx = i;
            break;
          }
        }
      }
      if (rumusHeaderRowIdx === -1) throw new Error('Header tidak ditemukan di sheet Rumus.');

      const rumusHeaders = rumusJson[rumusHeaderRowIdx] as string[];
      const rumusRows = rumusJson.slice(rumusHeaderRowIdx + 1);

      const noColR = rumusHeaders.findIndex(h => typeof h === 'string' && h.toLowerCase().includes('no'));
      const varColR = rumusHeaders.findIndex(h => typeof h === 'string' && (h.toLowerCase().includes('variable') || h.toLowerCase().includes('bidang')));
      const keyIndColR = rumusHeaders.findIndex(h => typeof h === 'string' && h.toLowerCase().includes('key indicator'));
      const indColR = rumusHeaders.findIndex(h => typeof h === 'string' && h.toLowerCase().includes('indikator'));
      const inputColR = rumusHeaders.findIndex(h => typeof h === 'string' && h.toLowerCase().includes('input'));
      const refColR = rumusHeaders.findIndex(h => typeof h === 'string' && h.toLowerCase().includes('referensi'));

      if (varColR === -1 || indColR === -1 || inputColR === -1) {
        throw new Error('Kolom wajib tidak ditemukan di sheet Rumus.');
      }

      // === BACA DESKRIPSI SKOR DARI SHEET TMA ===
      const tmaSheetName = workbook.SheetNames.find(name => name.includes('TMA'));
      if (!tmaSheetName) throw new Error('Sheet "TMA" tidak ditemukan.');
      const tmaWorksheet = workbook.Sheets[tmaSheetName];
      const tmaJson = XLSX.utils.sheet_to_json(tmaWorksheet, { header: 1 });
      if (tmaJson.length < 5) throw new Error('Sheet TMA tidak memiliki data.');

      // Cari header di sheet TMA
      let tmaHeaderRowIdx = -1;
      for (let i = 0; i < Math.min(10, tmaJson.length); i++) {
        const row = tmaJson[i] as any[];
        if (row.some(c => typeof c === 'string' && c.toLowerCase().includes('no')) &&
            row.some(c => typeof c === 'string' && c.toLowerCase().includes('skor'))) {
          tmaHeaderRowIdx = i;
          break;
        }
      }
      if (tmaHeaderRowIdx === -1) throw new Error('Header tidak ditemukan di sheet TMA.');

      const tmaHeaders = tmaJson[tmaHeaderRowIdx] as string[];
      const tmaRows = tmaJson.slice(tmaHeaderRowIdx + 1);

      // Kolom skor SELALU di index 4, 5, 6, 7, 8 — karena tidak ada header
      const scoreCol0 = 4;
      const scoreCol1 = 5;
      const scoreCol2 = 6;
      const scoreCol3 = 7;
      const scoreCol4 = 8;

      // Buat peta: nomor → deskripsi skor
      const scoreMap = new Map<number, string[]>();
      for (const row of tmaRows) {
        const no = row[0]; // Kolom No selalu di index 0
        if (typeof no === 'number' || (typeof no === 'string' && !isNaN(Number(no)))) {
          const nomor = Number(no);
          scoreMap.set(nomor, [
            (row[scoreCol0] || '').toString().trim(),
            (row[scoreCol1] || '').toString().trim(),
            (row[scoreCol2] || '').toString().trim(),
            (row[scoreCol3] || '').toString().trim(),
            (row[scoreCol4] || '').toString().trim(),
          ]);
        }
      }

      // === PROSES SOAL DARI RUMUS ===
      const finalStatus = status === 'Aktif' ? 'active' : 'inactive';
      const payloads: any[] = [];

      for (let i = 0; i < rumusRows.length; i++) {
        const row = rumusRows[i];
        const firstCell = row[noColR];
        if (firstCell === undefined || firstCell === '' || isNaN(Number(firstCell))) continue;

        const nomor = parseInt(firstCell, 10);
        const variableName = row[varColR]?.toString().trim();
        if (!variableName) continue;

        const variable = variableData?.find((v: any) => v.name === variableName);
        if (!variable) continue;

        const indikator = row[indColR]?.toString().trim() || '';
        const keyIndicator = row[keyIndColR]?.toString().trim() || '';
        const reference = row[refColR]?.toString().trim() || '';
        const inputVal = row[inputColR]?.toString().trim() || '';

        // Ambil deskripsi skor berdasarkan nomor
        const scoreDesc = scoreMap.get(nomor) || ['', '', '', '', ''];

        const nextRow = rumusRows[i + 1];
        const isPGDesc = nextRow && nextRow[inputColR]?.toString().startsWith('a.') && nextRow[inputColR].includes('b.');

        if (isPGDesc) {
          const pgText = nextRow[inputColR].toString().trim();
          const lines = pgText.split('\n').map(l => l.trim()).filter(Boolean);
          const answers = ['', '', '', '', ''];
          for (const line of lines) {
            const match = line.match(/^([a-e])\.\s*(.*)/i);
            if (match) {
              const idx = 'abcde'.indexOf(match[1].toLowerCase());
              if (idx >= 0 && idx < 5) answers[idx] = line;
            }
          }

          payloads.push({
            transformationVariable: { connect: { id: variable.id } },
            type: 'multitext',
            indicator: indikator,
            keyIndicator: keyIndicator,
            reference: reference,
            dataSource: '',
            questionText: inputVal,
            questionText2: '',
            questionText3: '',
            questionText4: '',
            answerText1: answers[0],
            answerText2: answers[1],
            answerText3: answers[2],
            answerText4: answers[3],
            answerText5: answers[4],
            scoreDescription0: scoreDesc[0],
            scoreDescription1: scoreDesc[1],
            scoreDescription2: scoreDesc[2],
            scoreDescription3: scoreDesc[3],
            scoreDescription4: scoreDesc[4],
            order: nomor,
            status: finalStatus,
          });
          i++; // skip baris deskripsi PG
        } else {
          let subQuestions = [];
          let j = i + 1;
          while (j < rumusRows.length && !rumusRows[j][noColR]) {
            const subInput = rumusRows[j][inputColR]?.toString().trim() || '';
            if (subInput) subQuestions.push(subInput);
            j++;
          }
          i = j - 1;

          payloads.push({
            transformationVariable: { connect: { id: variable.id } },
            type: 'text',
            indicator: indikator,
            keyIndicator: keyIndicator,
            reference: reference,
            dataSource: '',
            questionText: inputVal,
            questionText2: subQuestions[0] || '',
            questionText3: subQuestions[1] || '',
            questionText4: subQuestions[2] || '',
            answerText1: '',
            answerText2: '',
            answerText3: '',
            answerText4: '',
            answerText5: '',
            scoreDescription0: scoreDesc[0],
            scoreDescription1: scoreDesc[1],
            scoreDescription2: scoreDesc[2],
            scoreDescription3: scoreDesc[3],
            scoreDescription4: scoreDesc[4],
            order: nomor,
            status: finalStatus,
          });
        }
      }

      // Simpan
      for (const payload of payloads) {
        if (isEditMode && editNomor) {
          await updateMutate(editNomor, payload);
        } else {
          await createMutate(payload);
        }
      }

      localStorage.removeItem('editData');
      router.push('/daftar-assessment');
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menyimpan data.');
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
    { header: 'Indikator', key: 'indikator', width: '250px' },
    { header: 'Key Indicator', key: 'keyIndicator', width: '200px' },
    { header: 'Pertanyaan', key: 'pertanyaan1', width: '250px' },
    { header: 'Tipe', key: 'tipeSoal', width: '100px', className: 'text-center' },
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
            <p>Upload file Excel hasil pengisian TMA (format seperti contoh).</p>
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