'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from 'lucide-react';

// Interface untuk data assessment
interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  tipeSoal: string;
  tipePertanyaan: 'pg' | 'short-answer';
  status: 'Active' | 'Inactive';
  pertanyaan: string;
  pertanyaan2?: string;
  skor: { [key: number]: { min: number; max: number } };
  deskripsiSkor0: string;
  deskripsiSkor1: string;
  deskripsiSkor2: string;
  deskripsiSkor3: string;
  deskripsiSkor4: string;
  rentangJawaban?: { min: number; max: number };
  rentangJawaban2?: { min: number; max: number }; // tambah untuk pertanyaan 2
}

// Type untuk status input (UI)
type StatusInput = 'Aktif' | 'Non-Aktif';

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<'1 Pertanyaan' | '2 Pertanyaan' | ''>('');
  const [tipePertanyaan, setTipePertanyaan] = useState<'pg' | 'short-answer'>('pg');
  const [urutan, setUrutan] = useState<string>('');

  // Rentang jawaban: terpisah untuk setiap pertanyaan
  const [rentangPertanyaan1, setRentangPertanyaan1] = useState({ min: '', max: '' });
  const [rentangPertanyaan2, setRentangPertanyaan2] = useState({ min: '', max: '' });

  // Skor dan deskripsi
  const [skor, setSkor] = useState<{ [key: number]: { min: string; max: string } }>({
    0: { min: '0', max: '1.9' },
    1: { min: '2', max: '4.9' },
    2: { min: '5', max: '6.9' },
    3: { min: '7', max: '8.9' },
    4: { min: '9', max: '12' },
  });

  const [deskripsiSkor, setDeskripsiSkor] = useState<{ [key: number]: string }>({
    0: 'Tidak ada dokumentasi.',
    1: 'Ada dokumentasi dasar.',
    2: 'Dokumentasi sebagian lengkap.',
    3: 'Dokumentasi hampir lengkap.',
    4: 'Dokumentasi lengkap dan terupdate.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // Load data dari editData
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (!editData) return;

    try {
      const data = JSON.parse(editData);

      setNamaVariabel(data.variable || '');
      setBobot(data.bobot || 1);
      setIndikator(data.indikator || '');
      setPertanyaan1(data.pertanyaan || '');
      setPertanyaan2(data.pertanyaan2 || '');
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setJumlahPertanyaan(data.pertanyaan2 ? '2 Pertanyaan' : '1 Pertanyaan');
      setTipePertanyaan(data.tipePertanyaan || 'pg');

      if (data.rentangJawaban) {
        setRentangPertanyaan1({
          min: String(data.rentangJawaban.min),
          max: String(data.rentangJawaban.max),
        });
      }
      if (data.rentangJawaban2) {
        setRentangPertanyaan2({
          min: String(data.rentangJawaban2.min),
          max: String(data.rentangJawaban2.max),
        });
      }

      if (data.skor) {
        const loadedSkor: { [key: number]: { min: string; max: string } } = {};
        for (let i = 0; i <= 4; i++) {
          loadedSkor[i] = {
            min: String(data.skor[i]?.min ?? ''),
            max: String(data.skor[i]?.max ?? ''),
          };
        }
        setSkor(loadedSkor);
      }

      if (data.deskripsiSkor0 !== undefined) {
        setDeskripsiSkor({
          0: data.deskripsiSkor0,
          1: data.deskripsiSkor1,
          2: data.deskripsiSkor2,
          3: data.deskripsiSkor3,
          4: data.deskripsiSkor4,
        });
      } else if (data.deskripsiSkor) {
        setDeskripsiSkor(data.deskripsiSkor);
      }

      // Tentukan mode: hanya edit jika ada nomor
      if (data.nomor !== undefined && data.nomor !== null && data.nomor !== '') {
        setEditNomor(data.nomor);
        setIsEditMode(true);
      } else {
        setEditNomor(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan1.trim()) newErrors.pertanyaan1 = 'Wajib diisi';
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) {
      newErrors.pertanyaan2 = 'Wajib diisi';
    }
    if (!status) newErrors.status = 'Wajib dipilih';
    if (!jumlahPertanyaan) newErrors.jumlahPertanyaan = 'Wajib dipilih';

    // Validasi rentang pertanyaan 1
    if (tipePertanyaan === 'short-answer') {
      if (!rentangPertanyaan1.min) newErrors.rentangMin1 = 'Wajib diisi';
      if (!rentangPertanyaan1.max) newErrors.rentangMax1 = 'Wajib diisi';
      const min = parseFloat(rentangPertanyaan1.min);
      const max = parseFloat(rentangPertanyaan1.max);
      if (isNaN(min) || isNaN(max)) {
        if (!newErrors.rentangMin1) newErrors.rentangMin1 = 'Harus angka';
        if (!newErrors.rentangMax1) newErrors.rentangMax1 = 'Harus angka';
      } else if (min >= max) {
        newErrors.rentangMax1 = 'Max harus lebih besar dari min';
      }
    }

    // Validasi rentang pertanyaan 2
    if (jumlahPertanyaan === '2 Pertanyaan' && tipePertanyaan === 'short-answer') {
      if (!rentangPertanyaan2.min) newErrors.rentangMin2 = 'Wajib diisi';
      if (!rentangPertanyaan2.max) newErrors.rentangMax2 = 'Wajib diisi';
      const min2 = parseFloat(rentangPertanyaan2.min);
      const max2 = parseFloat(rentangPertanyaan2.max);
      if (isNaN(min2) || isNaN(max2)) {
        if (!newErrors.rentangMin2) newErrors.rentangMin2 = 'Harus angka';
        if (!newErrors.rentangMax2) newErrors.rentangMax2 = 'Harus angka';
      } else if (min2 >= max2) {
        newErrors.rentangMax2 = 'Max harus lebih besar dari min';
      }
    }

    Object.keys(deskripsiSkor).forEach((level) => {
      const numLevel = Number(level);
      if (!deskripsiSkor[numLevel]?.trim()) {
        newErrors[`deskripsiSkor${numLevel}`] = 'Wajib diisi';
      }
    });

    Object.keys(skor).forEach((level) => {
      const numLevel = Number(level);
      const min = parseFloat(skor[numLevel].min);
      const max = parseFloat(skor[numLevel].max);
      if (isNaN(min) || isNaN(max)) {
        newErrors[`skor${numLevel}`] = 'Wajib diisi';
      } else if (min >= max) {
        newErrors[`skor${numLevel}`] = 'Max harus lebih besar dari min';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    try {
      const saved = localStorage.getItem('assessmentList');
      let list: AssessmentItem[] = saved ? JSON.parse(saved) : [];

      const parsedSkor = Object.keys(skor).reduce((acc, key) => {
        const level = Number(key);
        acc[level] = {
          min: parseFloat(skor[level].min),
          max: parseFloat(skor[level].max),
        };
        return acc;
      }, {} as { [key: number]: { min: number; max: number } });

      const baseData = {
        variable: namaVariabel,
        bobot,
        indikator,
        tipeSoal: 'Pilihan Jawaban',
        tipePertanyaan,
        status: status === 'Aktif' ? 'Active' : 'Inactive',
        skor: parsedSkor,
        deskripsiSkor0: deskripsiSkor[0],
        deskripsiSkor1: deskripsiSkor[1],
        deskripsiSkor2: deskripsiSkor[2],
        deskripsiSkor3: deskripsiSkor[3],
        deskripsiSkor4: deskripsiSkor[4],
      } as const;

      let updated: AssessmentItem[];

      if (isEditMode && editNomor !== null) {
        updated = list.map((item) =>
          item.nomor === editNomor
            ? {
                ...item,
                ...baseData,
                pertanyaan: pertanyaan1,
                pertanyaan2: jumlahPertanyaan === '2 Pertanyaan' ? pertanyaan2 : undefined,
                rentangJawaban:
                  tipePertanyaan === 'short-answer'
                    ? {
                        min: parseFloat(rentangPertanyaan1.min),
                        max: parseFloat(rentangPertanyaan1.max),
                      }
                    : undefined,
                rentangJawaban2:
                  jumlahPertanyaan === '2 Pertanyaan' && tipePertanyaan === 'short-answer'
                    ? {
                        min: parseFloat(rentangPertanyaan2.min),
                        max: parseFloat(rentangPertanyaan2.max),
                      }
                    : undefined,
              }
            : item
        );
      } else {
        const lastNomor = list.length > 0 ? Math.max(...list.map((item) => item.nomor)) : 0;
        const count = jumlahPertanyaan === '2 Pertanyaan' ? 2 : 1;

        const newItems = Array.from({ length: count }, (_, i) => ({
          nomor: lastNomor + i + 1,
          ...baseData,
          pertanyaan: i === 0 ? pertanyaan1 : pertanyaan2,
          pertanyaan2: undefined,
          rentangJawaban:
            tipePertanyaan === 'short-answer'
              ? i === 0
                ? {
                    min: parseFloat(rentangPertanyaan1.min),
                    max: parseFloat(rentangPertanyaan1.max),
                  }
                : {
                    min: parseFloat(rentangPertanyaan2.min),
                    max: parseFloat(rentangPertanyaan2.max),
                  }
              : undefined,
        })) as AssessmentItem[];

        updated = [...list, ...newItems];
      }

      localStorage.setItem('assessmentList', JSON.stringify(updated));
      localStorage.setItem('newDataAdded', 'true');
      localStorage.removeItem('editData');
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

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

  const handleRadioClick = (value: '1 Pertanyaan' | '2 Pertanyaan') => {
    setJumlahPertanyaan((prev) => (prev === value ? '' : value));
    if (jumlahPertanyaan !== value) {
      setTipePertanyaan('pg');
    }
  };

  const isFormValid = () => {
    if (!namaVariabel.trim()) return false;
    if (!indikator.trim()) return false;
    if (!pertanyaan1.trim()) return false;
    if (!status) return false;
    if (!jumlahPertanyaan) return false;
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) return false;
    if (tipePertanyaan === 'short-answer') {
      const min1 = parseFloat(rentangPertanyaan1.min);
      const max1 = parseFloat(rentangPertanyaan1.max);
      if (isNaN(min1) || isNaN(max1) || min1 >= max1) return false;
    }
    if (jumlahPertanyaan === '2 Pertanyaan' && tipePertanyaan === 'short-answer') {
      const min2 = parseFloat(rentangPertanyaan2.min);
      const max2 = parseFloat(rentangPertanyaan2.max);
      if (isNaN(min2) || isNaN(max2) || min2 >= max2) return false;
    }
    return true;
  };

  return (
    <div className="flex min-h-screen">
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
        <div
          className="bg-white p-6 rounded-xl shadow-md mx-auto"
          style={{
            width: '90vw',
            maxWidth: '1200px',
            minWidth: '320px',
            height: 'calc(100vh - 120px)',
            maxHeight: '700px',
            marginTop: '40px',
            overflowY: 'auto',
          }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditMode ? 'Edit Soal: Pilihan Jawaban' : 'Soal Baru: Pilihan Jawaban'}
          </h1>

          {/* Type Soal & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type Soal</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={handleTypeChange}
                defaultValue="pilihan-jawaban"
              >
                <option value="">Pilih Type Soal</option>
                <option value="pilihan-jawaban">Pilihan Jawaban</option>
                <option value="api-igracias">API dari iGracias</option>
                <option value="submit-excel">Submit Jawaban Excel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusInput)}
              >
                <option value="">Pilih Status</option>
                <option value="Aktif">Active</option>
                <option value="Non-Aktif">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Nama Variabel & Indikator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Variabel</label>
              <input
                type="text"
                className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={namaVariabel}
                onChange={(e) => setNamaVariabel(e.target.value)}
                placeholder="Masukkan Nama Variabel"
              />
              {errors.namaVariabel && <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indikator</label>
              <textarea
                className={`w-full border ${errors.indikator ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={indikator}
                onChange={(e) => setIndikator(e.target.value)}
                placeholder="Masukkan Indikator"
                rows={2}
              ></textarea>
              {errors.indikator && <p className="text-red-500 text-xs mt-1">{errors.indikator}</p>}
            </div>
          </div>

          {/* Deskripsi Skor */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Deskripsi Skor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className="flex flex-col space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Deskripsi Skor {level}</label>
                  <textarea
                    value={deskripsiSkor[level]}
                    onChange={(e) =>
                      setDeskripsiSkor((prev) => ({
                        ...prev,
                        [level]: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Deskripsi untuk skor ${level}`}
                  />
                  {errors[`deskripsiSkor${level}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`deskripsiSkor${level}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
      <label className="block text-sm font-medium text-gray-700">Urutan</label>
      <input
        type="number"
        value={urutan}
        onChange={(e) => setUrutan(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 text-sm"
        placeholder="Masukkan urutan"
        min="1"
      />
      {errors.urutan && <p className="text-red-500 text-xs mt-1">{errors.urutan}</p>}
    </div>

          {/* Jumlah Pertanyaan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pertanyaan</label>
            <div className="flex space-x-6">
              {(['1 Pertanyaan', '2 Pertanyaan'] as const).map((value) => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                  <input
                    type="radio"
                    name="jumlahPertanyaan"
                    value={value}
                    checked={jumlahPertanyaan === value}
                    onClick={() => handleRadioClick(value)}
                    readOnly
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipe Pertanyaan */}
          {jumlahPertanyaan && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pertanyaan</label>
              <div className="flex space-x-6">
                {[
                  { value: 'pg' as const, label: 'Pilihan Ganda' },
                  { value: 'short-answer' as const, label: 'Jawaban Singkat' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                    <input
                      type="radio"
                      name="tipePertanyaan"
                      value={option.value}
                      checked={tipePertanyaan === option.value}
                      onChange={() => setTipePertanyaan(option.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pertanyaan 1 */}
          {jumlahPertanyaan && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan 1</label>
                <textarea
                  className={`w-full border ${errors.pertanyaan1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  value={pertanyaan1}
                  onChange={(e) => setPertanyaan1(e.target.value)}
                  placeholder="Masukkan pertanyaan..."
                  rows={2}
                ></textarea>
                {errors.pertanyaan1 && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan1}</p>}
              </div>

              {tipePertanyaan === 'pg' ? (
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban A</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban B</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban C</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban D</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="0" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="1" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="2" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="3" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue=">3" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Jawaban (Pertanyaan 1)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Min</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full border ${errors.rentangMin1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangPertanyaan1.min}
                        onChange={(e) => setRentangPertanyaan1({ ...rentangPertanyaan1, min: e.target.value })}
                      />
                      {errors.rentangMin1 && <p className="text-red-500 text-xs mt-1">{errors.rentangMin1}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Max</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full border ${errors.rentangMax1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangPertanyaan1.max}
                        onChange={(e) => setRentangPertanyaan1({ ...rentangPertanyaan1, max: e.target.value })}
                      />
                      {errors.rentangMax1 && <p className="text-red-500 text-xs mt-1">{errors.rentangMax1}</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pertanyaan 2 */}
          {jumlahPertanyaan === '2 Pertanyaan' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan 2</label>
                <textarea
                  className={`w-full border ${errors.pertanyaan2 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  value={pertanyaan2}
                  onChange={(e) => setPertanyaan2(e.target.value)}
                  placeholder="Masukkan pertanyaan..."
                  rows={2}
                ></textarea>
                {errors.pertanyaan2 && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan2}</p>}
              </div>

              {tipePertanyaan === 'pg' ? (
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban A</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban B</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban C</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban D</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="0" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="1" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="2" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="3" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue=">3" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Jawaban (Pertanyaan 2)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Min</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full border ${errors.rentangMin2 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangPertanyaan2.min}
                        onChange={(e) => setRentangPertanyaan2({ ...rentangPertanyaan2, min: e.target.value })}
                      />
                      {errors.rentangMin2 && <p className="text-red-500 text-xs mt-1">{errors.rentangMin2}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Max</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full border ${errors.rentangMax2 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangPertanyaan2.max}
                        onChange={(e) => setRentangPertanyaan2({ ...rentangPertanyaan2, max: e.target.value })}
                      />
                      {errors.rentangMax2 && <p className="text-red-500 text-xs mt-1">{errors.rentangMax2}</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit Rentang Skor */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Edit Rentang Skor (0-4)</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <th key={level} className="border border-gray-300 px-3 py-2 bg-gray-100 text-center font-medium">
                      Skor {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <td key={level} className="border border-gray-300 px-0 py-2 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          step="0.1"
                          className={`w-16 border ${errors[`skor${level}`] ? 'border-red-500' : 'border-gray-300'} rounded-md p-1 text-sm text-center`}
                          value={skor[level].min}
                          onChange={(e) =>
                            setSkor((prev) => ({
                              ...prev,
                              [level]: { ...prev[level], min: e.target.value },
                            }))
                          }
                        />
                        <div className="w-px bg-gray-300 h-6 mx-1"></div>
                        <input
                          type="number"
                          step="0.1"
                          className={`w-16 border ${errors[`skor${level}`] ? 'border-red-500' : 'border-gray-300'} rounded-md p-1 text-sm text-center`}
                          value={skor[level].max}
                          onChange={(e) =>
                            setSkor((prev) => ({
                              ...prev,
                              [level]: { ...prev[level], max: e.target.value },
                            }))
                          }
                        />
                      </div>
                      {errors[`skor${level}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`skor${level}`]}</p>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 gap-2">
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
              disabled={!isFormValid()}
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSave}
              className="rounded-[12px] px-4 py-2 text-sm font-semibold"
            >
              Simpan
            </Button>
          </div>
        </div>
      </main>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <ModalConfirm
          isOpen={true}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmModal(false)}
          header={isEditMode ? 'Perbarui Soal?' : 'Simpan Soal Baru?'}
          title={isEditMode ? 'Perbarui assessment?' : 'Simpan assessment baru?'}
          confirmLabel="Ya, Simpan"
          cancelLabel="Batal"
        >
          <p className="text-gray-700">
            Anda akan {isEditMode ? 'memperbarui' : 'menambahkan'}{' '}
            <strong>{jumlahPertanyaan === '2 Pertanyaan' ? '2' : '1'}</strong> soal.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Status: <strong>{status}</strong>
          </p>
        </ModalConfirm>
      )}
    </div>
  );
}