'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from 'lucide-react';

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [status, setStatus] = useState('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tipe jawaban per pertanyaan
  const [tipeJawaban1, setTipeJawaban1] = useState<'pg' | 'singkat'>('pg');
  const [tipeJawaban2, setTipeJawaban2] = useState<'pg' | 'singkat'>('pg');

  // Soal tambahan untuk jawaban singkat
  const [soalSingkat1, setSoalSingkat1] = useState('');
  const [soalSingkat2, setSoalSingkat2] = useState('');

  // Rentang nilai untuk konversi ke skor (jawaban singkat) - gunakan null
  const [rentangSingkat1, setRentangSingkat1] = useState<{
    [key: number]: { min: number | null; max: number | null };
  }>({
    0: { min: null, max: null },
    1: { min: null, max: null },
    2: { min: null, max: null },
    3: { min: null, max: null },
    4: { min: null, max: null },
  });

  const [rentangSingkat2, setRentangSingkat2] = useState<{
    [key: number]: { min: number | null; max: number | null };
  }>({
    0: { min: null, max: null },
    1: { min: null, max: null },
    2: { min: null, max: null },
    3: { min: null, max: null },
    4: { min: null, max: null },
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

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // Fungsi bantu format dan parse angka
  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '';
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  const parseNumber = (value: string): number | null => {
    if (value === '' || value == null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  // Load data jika dalam mode edit
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (editData) {
      try {
        const data = JSON.parse(editData);
        setNamaVariabel(data.variable || '');
        setBobot(data.bobot || 1);
        setIndikator(data.indikator || '');
        setPertanyaan1(data.pertanyaan || '');
        setPertanyaan2(data.pertanyaan2 || '');
        setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
        setJumlahPertanyaan(data.pertanyaan2 ? '2 Pertanyaan' : '1 Pertanyaan');

        setTipeJawaban1(data.tipeJawaban1 === 'singkat' ? 'singkat' : 'pg');
        if (data.tipeJawaban2 !== undefined) {
          setTipeJawaban2(data.tipeJawaban2 === 'singkat' ? 'singkat' : 'pg');
        }

        if (data.soalSingkat1) setSoalSingkat1(data.soalSingkat1);
        if (data.soalSingkat2) setSoalSingkat2(data.soalSingkat2);

        if (data.rentangSingkat1) {
          const loaded = { ...data.rentangSingkat1 };
          for (let level = 0; level <= 4; level++) {
            if (!loaded[level]) loaded[level] = { min: null, max: null };
            loaded[level].min = loaded[level].min == null ? null : parseFloat(loaded[level].min);
            loaded[level].max = loaded[level].max == null ? null : parseFloat(loaded[level].max);
            if (isNaN(loaded[level].min)) loaded[level].min = null;
            if (isNaN(loaded[level].max)) loaded[level].max = null;
          }
          setRentangSingkat1(loaded);
        }

        if (data.rentangSingkat2) {
          const loaded = { ...data.rentangSingkat2 };
          for (let level = 0; level <= 4; level++) {
            if (!loaded[level]) loaded[level] = { min: null, max: null };
            loaded[level].min = loaded[level].min == null ? null : parseFloat(loaded[level].min);
            loaded[level].max = loaded[level].max == null ? null : parseFloat(loaded[level].max);
            if (isNaN(loaded[level].min)) loaded[level].min = null;
            if (isNaN(loaded[level].max)) loaded[level].max = null;
          }
          setRentangSingkat2(loaded);
        }

        if (data.deskripsiSkor0 !== undefined) {
          setDeskripsiSkor({
            0: data.deskripsiSkor0 || '',
            1: data.deskripsiSkor1 || '',
            2: data.deskripsiSkor2 || '',
            3: data.deskripsiSkor3 || '',
            4: data.deskripsiSkor4 || '',
          });
        } else if (data.deskripsiSkor) {
          setDeskripsiSkor(data.deskripsiSkor);
        }

        setEditNomor(data.nomor || null);
        setIsEditMode(true);
      } catch (err) {
        console.error('Gagal parsing editData:', err);
        alert('Gagal memuat data edit. Cek console.');
      }
    }
  }, []);

  // Validasi form
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

    // Validasi deskripsi skor
    for (const level of [0, 1, 2, 3, 4]) {
      if (!deskripsiSkor[level]?.trim()) {
        newErrors[`deskripsiSkor${level}`] = 'Deskripsi skor harus diisi';
      }
    }

    // Validasi soal singkat
    if (tipeJawaban1 === 'singkat' && !soalSingkat1.trim()) {
      newErrors.soalSingkat1 = 'Wajib diisi';
    }
    if (jumlahPertanyaan === '2 Pertanyaan' && tipeJawaban2 === 'singkat' && !soalSingkat2.trim()) {
      newErrors.soalSingkat2 = 'Wajib diisi';
    }

    // Validasi rentang singkat 1
    if (tipeJawaban1 === 'singkat') {
      for (const level of [0, 1, 2, 3, 4]) {
        const r = rentangSingkat1[level];
        if (r.min === null || r.max === null) {
          newErrors[`rentangSingkat1_${level}`] = `Skor ${level}: Min dan Max wajib diisi`;
        } else if (r.min > r.max) {
          newErrors[`rentangSingkat1_${level}`] = `Skor ${level}: Min tidak boleh > Max`;
        }
      }
    }

    // Validasi rentang singkat 2
    if (jumlahPertanyaan === '2 Pertanyaan' && tipeJawaban2 === 'singkat') {
      for (const level of [0, 1, 2, 3, 4]) {
        const r = rentangSingkat2[level];
        if (r.min === null || r.max === null) {
          newErrors[`rentangSingkat2_${level}`] = `Skor ${level}: Min dan Max wajib diisi`;
        } else if (r.min > r.max) {
          newErrors[`rentangSingkat2_${level}`] = `Skor ${level}: Min tidak boleh > Max`;
        }
      }
    }

    setErrors(newErrors);
    console.log('🔍 Validasi Errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    console.log('🔍 handleSave dipanggil');
    if (!validate()) {
      alert('Form tidak valid. Lihat console (F12) untuk detail.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    try {
      // Deep clone untuk pastikan tidak ada reference error
      const cleanRentang1 = JSON.parse(JSON.stringify(rentangSingkat1));
      const cleanRentang2 = JSON.parse(JSON.stringify(rentangSingkat2));

      const baseData = {
        variable: namaVariabel,
        bobot,
        indikator,
        tipeSoal: 'Pilihan Jawaban',
        status: status === 'Aktif' ? 'Active' : 'Inactive',
        deskripsiSkor0: deskripsiSkor[0],
        deskripsiSkor1: deskripsiSkor[1],
        deskripsiSkor2: deskripsiSkor[2],
        deskripsiSkor3: deskripsiSkor[3],
        deskripsiSkor4: deskripsiSkor[4],
        tipeJawaban1,
        tipeJawaban2,
        soalSingkat1,
        soalSingkat2,
        rentangSingkat1: cleanRentang1,
        rentangSingkat2: cleanRentang2,
      };

      const saved = localStorage.getItem('assessmentList');
      let list: any[] = saved ? JSON.parse(saved) : [];

      let updated: any[];

      if (isEditMode && editNomor !== null) {
        updated = list.map((item) =>
          item.nomor === editNomor
            ? {
                ...item,
                ...baseData,
                pertanyaan: pertanyaan1,
                pertanyaan2: jumlahPertanyaan === '2 Pertanyaan' ? pertanyaan2 : undefined,
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
        }));

        updated = [...list, ...newItems];
      }

      console.log('✅ Data berhasil disimpan:', updated);
      localStorage.setItem('assessmentList', JSON.stringify(updated));
      localStorage.setItem('newDataAdded', 'true');
      localStorage.removeItem('editData');
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('❌ Gagal menyimpan data:', error);
      alert('Gagal menyimpan data. Cek console (F12) untuk detail.');
    }
  };

  const handleCancel = () => {
    if (confirm('Batalkan perubahan?')) {
      localStorage.removeItem('editData');
      router.push('/daftar-assessment/tambah-assessment');
    }
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

  const handleRadioClick = (value: string) => {
    setJumlahPertanyaan(prev => prev === value ? '' : value);
  };

  const isFormValid = () => {
    if (!namaVariabel.trim()) return false;
    if (!indikator.trim()) return false;
    if (!pertanyaan1.trim()) return false;
    if (!status) return false;
    if (!jumlahPertanyaan) return false;
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) return false;
    return true;
  };

  // Hitung rentang rata-rata otomatis jika 2 pertanyaan & keduanya singkat
  const hitungRentangRataRata = () => {
    if (jumlahPertanyaan !== '2 Pertanyaan' || tipeJawaban1 !== 'singkat' || tipeJawaban2 !== 'singkat') {
      return null;
    }

    const rataRata: { [key: number]: { min: number; max: number } } = {};

    for (let level = 0; level <= 4; level++) {
      const min1 = rentangSingkat1[level].min ?? 0;
      const max1 = rentangSingkat1[level].max ?? 0;
      const min2 = rentangSingkat2[level].min ?? 0;
      const max2 = rentangSingkat2[level].max ?? 0;

      const minAvg = Math.round(((min1 + min2) / 2) * 10) / 10;
      const maxAvg = Math.round(((max1 + max2) / 2) * 10) / 10;

      rataRata[level] = { min: minAvg, max: maxAvg };
    }

    return rataRata;
  };

  const rentangGabungan = hitungRentangRataRata();

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
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Pilih Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Skor {level}</label>
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
              {['1 Pertanyaan', '2 Pertanyaan'].map((value) => (
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Jawaban</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipeJawaban1 === 'pg'}
                      onChange={() => setTipeJawaban1('pg')}
                      className="text-blue-600"
                    />
                    <span>Pilihan Ganda (A-E)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipeJawaban1 === 'singkat'}
                      onChange={() => setTipeJawaban1('singkat')}
                      className="text-blue-600"
                    />
                    <span>Jawaban Singkat (Input Numerik)</span>
                  </label>
                </div>
              </div>

              {/* Jawaban Singkat 1 */}
              {tipeJawaban1 === 'singkat' && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soal Jawaban Singkat (Pertanyaan 1)
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      value={soalSingkat1}
                      onChange={(e) => setSoalSingkat1(e.target.value)}
                      placeholder="Contoh: Masukkan nilai rata-rata kehadiran (%)"
                    />
                    {errors.soalSingkat1 && <p className="text-red-500 text-xs mt-1">{errors.soalSingkat1}</p>}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Rentang Konversi ke Skor</h4>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-2 py-1 bg-gray-100">Skor</th>
                          <th className="border border-gray-300 px-2 py-1 bg-gray-100">Min</th>
                          <th className="border border-gray-300 px-2 py-1 bg-gray-100">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1, 2, 3, 4].map((level) => (
                          <tr key={level}>
                            <td className="border border-gray-300 px-2 py-1 text-center font-medium">{level}</td>
                            <td className="border border-gray-300 px-2 py-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Min"
                                className="w-full border border-gray-300 rounded p-1 text-center"
                                value={formatNumber(rentangSingkat1[level].min)}
                                onChange={(e) => {
                                  const val = parseNumber(e.target.value);
                                  setRentangSingkat1((prev) => ({
                                    ...prev,
                                    [level]: { ...prev[level], min: val },
                                  }));
                                }}
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Max"
                                className="w-full border border-gray-300 rounded p-1 text-center"
                                value={formatNumber(rentangSingkat1[level].max)}
                                onChange={(e) => {
                                  const val = parseNumber(e.target.value);
                                  setRentangSingkat1((prev) => ({
                                    ...prev,
                                    [level]: { ...prev[level], max: val },
                                  }));
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {errors.rentangSingkat1_0 && (
                      <p className="text-red-500 text-xs mt-1">{errors.rentangSingkat1_0}</p>
                    )}
                  </div>
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Jawaban</label>
                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                        <input
                          type="radio"
                          checked={tipeJawaban2 === 'pg'}
                          onChange={() => setTipeJawaban2('pg')}
                          className="text-blue-600"
                        />
                        <span>Pilihan Ganda (A-E)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                        <input
                          type="radio"
                          checked={tipeJawaban2 === 'singkat'}
                          onChange={() => setTipeJawaban2('singkat')}
                          className="text-blue-600"
                        />
                        <span>Jawaban Singkat (Input Numerik)</span>
                      </label>
                    </div>
                  </div>

                  {tipeJawaban2 === 'singkat' && (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soal Jawaban Singkat (Pertanyaan 2)
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 text-sm"
                          value={soalSingkat2}
                          onChange={(e) => setSoalSingkat2(e.target.value)}
                          placeholder="Contoh: Jumlah dokumen yang diunggah"
                        />
                        {errors.soalSingkat2 && <p className="text-red-500 text-xs mt-1">{errors.soalSingkat2}</p>}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Rentang Konversi ke Skor</h4>
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-2 py-1 bg-gray-100">Skor</th>
                              <th className="border border-gray-300 px-2 py-1 bg-gray-100">Min</th>
                              <th className="border border-gray-300 px-2 py-1 bg-gray-100">Max</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[0, 1, 2, 3, 4].map((level) => (
                              <tr key={level}>
                                <td className="border border-gray-300 px-2 py-1 text-center font-medium">{level}</td>
                                <td className="border border-gray-300 px-2 py-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Min"
                                    className="w-full border border-gray-300 rounded p-1 text-center"
                                    value={formatNumber(rentangSingkat2[level].min)}
                                    onChange={(e) => {
                                      const val = parseNumber(e.target.value);
                                      setRentangSingkat2((prev) => ({
                                        ...prev,
                                        [level]: { ...prev[level], min: val },
                                      }));
                                    }}
                                  />
                                </td>
                                <td className="border border-gray-300 px-2 py-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Max"
                                    className="w-full border border-gray-300 rounded p-1 text-center"
                                    value={formatNumber(rentangSingkat2[level].max)}
                                    onChange={(e) => {
                                      const val = parseNumber(e.target.value);
                                      setRentangSingkat2((prev) => ({
                                        ...prev,
                                        [level]: { ...prev[level], max: val },
                                      }));
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {errors.rentangSingkat2_0 && (
                          <p className="text-red-500 text-xs mt-1">{errors.rentangSingkat2_0}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Rentang Skor Rata-Rata ((P1 + P2) / 2) */}
          {rentangGabungan && (
            <div className="mb-6 overflow-x-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Rentang Skor Rata-Rata ((P1 + P2) / 2)
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                Skor dihitung dari <strong>rata-rata nilai dari kedua pertanyaan</strong>
              </p>
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
                    {[0, 1, 2, 3, 4].map((level) => {
                      const min = rentangGabungan[level].min;
                      const max = rentangGabungan[level].max;
                      const formattedMin = Number.isInteger(min) ? min : min.toFixed(1);
                      const formattedMax = Number.isInteger(max) ? max : max.toFixed(1);
                      return (
                        <td key={level} className="border border-gray-300 px-0 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <span className="flex-1 text-left px-2">{formattedMin}</span>
                            <div className="w-px bg-gray-300 h-6"></div>
                            <span className="flex-1 text-right px-2">{formattedMax}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Rentang Skor Referensi (jika TIDAK digabung) */}
          {!rentangGabungan && (
            <div className="mb-6 overflow-x-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Rentang Skor Referensi (Pertanyaan 1)</h4>
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
                          <span className="flex-1 text-left px-2">
                            {rentangSingkat1[level].min === null ? '-' : rentangSingkat1[level].min}
                          </span>
                          <div className="w-px bg-gray-300 h-6"></div>
                          <span className="flex-1 text-right px-2">
                            {rentangSingkat1[level].max === null ? '-' : rentangSingkat1[level].max}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 gap-2">
            <Button
              variant='ghost'
              icon={X}
              iconPosition="left"
              onClick={handleCancel}
              className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              disabled={!isFormValid()}
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSave}
              className="rounded-[12px] px-17 py-2 text-sm font-semibold"
            >
              Simpan
            </Button>
          </div>

          {/* Debug: Tampilkan jika form tidak valid */}
          {!isFormValid() && (
            <p className="text-red-500 text-xs mt-2 text-right">
              Lengkapi semua field wajib
            </p>
          )}
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