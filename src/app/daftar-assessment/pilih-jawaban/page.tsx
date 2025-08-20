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
  const [status, setStatus] = useState<StatusInput>('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<'1 Pertanyaan' | '2 Pertanyaan' | ''>('');
  const [tipePertanyaan, setTipePertanyaan] = useState<'pg' | 'short-answer'>('pg');

  // Rentang jawaban singkat: awalnya kosong
  const [rentangJawabanSingkat, setRentangJawabanSingkat] = useState({
    min: '',
    max: '',
  });

  // ✅ Skor bisa diedit user (string agar bisa kosong saat input)
  const [skor, setSkor] = useState<{ [key: number]: { min: string; max: string } }>({
    0: { min: '0', max: '1.9' },
    1: { min: '2', max: '4.9' },
    2: { min: '5', max: '6.9' },
    3: { min: '7', max: '8.9' },
    4: { min: '9', max: '12' },
  });

  // Deskripsi Skor
  const [deskripsiSkor, setDeskripsiSkor] = useState<{
    [key: number]: string;
  }>({
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

  // Load data edit
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (editData) {
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
        setRentangJawabanSingkat({
          min: String(data.rentangJawaban.min),
          max: String(data.rentangJawaban.max),
        });
      }

      if (data.skor) {
        const loadedSkor: { [key: number]: { min: string; max: string } } = {};
        for (let i = 0; i <= 4; i++) {
          loadedSkor[i] = {
            min: String(data.skor[i].min),
            max: String(data.skor[i].max),
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

      setEditNomor(data.nomor);
      setIsEditMode(true);
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

    // Validasi rentang jawaban singkat
    if (tipePertanyaan === 'short-answer') {
      if (!rentangJawabanSingkat.min) newErrors.rentangMin = 'Wajib diisi';
      if (!rentangJawabanSingkat.max) newErrors.rentangMax = 'Wajib diisi';
      const min = parseFloat(rentangJawabanSingkat.min);
      const max = parseFloat(rentangJawabanSingkat.max);
      if (isNaN(min) || isNaN(max)) {
        if (!newErrors.rentangMin) newErrors.rentangMin = 'Harus angka';
        if (!newErrors.rentangMax) newErrors.rentangMax = 'Harus angka';
      } else if (min >= max) {
        newErrors.rentangMax = 'Max harus lebih besar dari min';
      }
    }

    // Validasi deskripsi skor
    Object.keys(deskripsiSkor).forEach((level) => {
      const numLevel = Number(level);
      if (!deskripsiSkor[numLevel]?.trim()) {
        newErrors[`deskripsiSkor${numLevel}`] = 'Deskripsi skor harus diisi';
      }
    });

    // Validasi rentang skor
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

      // Konversi skor ke number
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
                        min: parseFloat(rentangJawabanSingkat.min),
                        max: parseFloat(rentangJawabanSingkat.max),
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
              ? {
                  min: parseFloat(rentangJawabanSingkat.min),
                  max: parseFloat(rentangJawabanSingkat.max),
                }
              : undefined,
        })) as AssessmentItem[];

        updated = [...list, ...newItems];
      }

      localStorage.setItem('assessmentList', JSON.stringify(updated));
      console.log('✅ Data berhasil disimpan:', updated);

      localStorage.setItem('newDataAdded', 'true');
      localStorage.removeItem('editData');
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('❌ Gagal menyimpan data:', error);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment/tambah-assessment');
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
      if (!rentangJawabanSingkat.min || !rentangJawabanSingkat.max) return false;
      const min = parseFloat(rentangJawabanSingkat.min);
      const max = parseFloat(rentangJawabanSingkat.max);
      if (isNaN(min) || isNaN(max) || min >= max) return false;
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
                <option value="Non-Aktif">Aktif</option>
                <option value="Aktif">Non-Aktif</option>
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

          {/* Tipe Pertanyaan (PG / Jawaban Singkat) */}
          {jumlahPertanyaan && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pertanyaan</label>
              <div className="flex space-x-6">
                {[
                  { value: 'pg' as const, label: 'Pilihan Ganda' },
                  { value: 'short-answer' as const, label: 'Jawaban Singkat' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700"
                  >
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

          {/* Form Pertanyaan dan Input Dinamis */}
          {jumlahPertanyaan && tipePertanyaan && (
            <>
              {/* Pertanyaan 1 */}
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

              {/* Input berdasarkan tipe soal */}
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
                        <td className="border  px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="0"
                            defaultValue="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="1"
                            defaultValue="1"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="2"
                            defaultValue="2"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="3"
                            defaultValue="3"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder=">3"
                            defaultValue=">3"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Jawaban (Jawaban Singkat)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Min</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className={`w-full border ${errors.rentangMin ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangJawabanSingkat.min}
                        onChange={(e) => setRentangJawabanSingkat({ ...rentangJawabanSingkat, min: e.target.value })}
                      />
                      {errors.rentangMin && <p className="text-red-500 text-xs mt-1">{errors.rentangMin}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Nilai Max</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="10"
                        className={`w-full border ${errors.rentangMax ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                        value={rentangJawabanSingkat.max}
                        onChange={(e) => setRentangJawabanSingkat({ ...rentangJawabanSingkat, max: e.target.value })}
                      />
                      {errors.rentangMax && <p className="text-red-500 text-xs mt-1">{errors.rentangMax}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nilai yang dimasukkan user akan dikonversi ke skor berdasarkan tabel di bawah.
                  </p>
                </div>
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
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="0"
                                defaultValue="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="1"
                                defaultValue="1"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="2"
                                defaultValue="2"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="3"
                                defaultValue="3"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder=">3"
                                defaultValue=">3"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rentang Jawaban (Pertanyaan 2)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600">Nilai Min</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            className={`w-full border ${errors.rentangMin ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                            value={rentangJawabanSingkat.min}
                            onChange={(e) => setRentangJawabanSingkat({ ...rentangJawabanSingkat, min: e.target.value })}
                          />
                          {errors.rentangMin && <p className="text-red-500 text-xs mt-1">{errors.rentangMin}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600">Nilai Max</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="10"
                            className={`w-full border ${errors.rentangMax ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm`}
                            value={rentangJawabanSingkat.max}
                            onChange={(e) => setRentangJawabanSingkat({ ...rentangJawabanSingkat, max: e.target.value })}
                          />
                          {errors.rentangMax && <p className="text-red-500 text-xs mt-1">{errors.rentangMax}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Nilai yang dimasukkan user akan dikonversi ke skor berdasarkan tabel di bawah.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Edit Rentang Skor (0-4) */}
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
            <p className="text-xs text-gray-500 mt-1">Edit rentang nilai untuk setiap skor.</p>
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